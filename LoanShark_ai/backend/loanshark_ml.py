"""
LoanShark AI - ML Inference Module

This module contains all functions needed for analyzing loan contracts.
Extracted from the trained Jupyter notebook.
"""

import re
import json
import joblib
import numpy as np
from pathlib import Path


# === Feature Extraction Functions ===


def extract_apr(text):
    """Extract APR value from text."""
    patterns = [
        r"APR[:\s]+([0-9]+\.?[0-9]*)%",
        r"Annual Percentage Rate[:\s]+([0-9]+\.?[0-9]*)%",
        r"interest rate[:\s]+([0-9]+\.?[0-9]*)%",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return -1


def extract_fee(text, fee_type):
    """Extract specific fee value."""
    patterns = [
        rf"{fee_type}[:\s]+\$([0-9]+\.?[0-9]*)",
        rf"{fee_type}[:\s]+([0-9]+\.?[0-9]*)%",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return -1


def extract_term_days(text):
    """Extract loan term in days."""
    day_match = re.search(r"Term[:\s]+([0-9]+)\s*days?", text, re.IGNORECASE)
    if day_match:
        return int(day_match.group(1))

    month_match = re.search(r"Term[:\s]+([0-9]+)\s*months?", text, re.IGNORECASE)
    if month_match:
        return int(month_match.group(1)) * 30

    return -1


def count_keywords(text, keywords):
    """Count occurrences of keywords (case-insensitive)."""
    count = 0
    text_lower = text.lower()
    for keyword in keywords:
        count += text_lower.count(keyword.lower())
    return count


def has_pattern(text, patterns):
    """Check if any pattern exists in text."""
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return 1
    return 0


def extract_features(text):
    """Extract all features from loan contract text."""
    features = {}

    # === APR & Cost Features ===
    apr = extract_apr(text)
    features["apr_value"] = apr if apr > 0 else 0
    features["apr_missing"] = 1 if apr == -1 else 0
    features["apr_over_100"] = 1 if apr > 100 else 0
    features["apr_over_300"] = 1 if apr > 300 else 0

    # === Fee Features ===
    features["late_fee_value"] = max(0, extract_fee(text, "Late Fee"))
    features["origination_fee_value"] = max(0, extract_fee(text, "Origination Fee"))
    features["service_fee_value"] = max(0, extract_fee(text, "Service Fee"))
    features["renewal_fee_value"] = max(0, extract_fee(text, "Renewal Fee"))

    fee_keywords = ["fee", "charge", "penalty", "service fee", "processing"]
    features["fee_word_count"] = count_keywords(text, fee_keywords)

    features["mentions_per_100"] = has_pattern(
        text, [r"\$[0-9]+\s*per\s*\$100", r"per\s*\$100\s*borrowed"]
    )

    # === Term & Payment Features ===
    term = extract_term_days(text)
    features["term_days"] = term if term > 0 else 0
    features["term_very_short"] = 1 if 0 < term <= 14 else 0

    features["has_single_payment_due"] = has_pattern(
        text, [r"single payment", r"due on payday", r"payment due.*payday"]
    )

    features["has_monthly_payment"] = has_pattern(
        text, [r"monthly", r"payment schedule.*monthly"]
    )

    # === Clause Detection ===
    features["has_rollover_or_renewal"] = has_pattern(
        text, [r"rollover", r"renew", r"renewal", r"extend", r"automatically renew"]
    )

    features["has_balloon_payment"] = has_pattern(
        text, [r"balloon payment", r"balloon"]
    )

    # Auto-debit: require authorization + debit language CLOSE TOGETHER
    # AND exclude "optional" / "enrollment" / "may" language
    # This prevents false positives on "autopay enrollment optional"

    # First check if text has exclusion words (optional, enrollment, negations)
    has_optional_language = has_pattern(
        text,
        [
            r"optional",
            r"enrollment",
            r"may enroll",
            r"can enroll",
            r"elect to",
            r"may not",
            r"no continuous",
            r"no blanket",
            r"only.*scheduled",
            r"may be cancelled",
            r"may revoke",
            r"can opt out",
        ],
    )

    # Only detect auto-debit if we find authorization + debit close together
    # Pattern: (authorize|permission|grant) within 50 chars of (debit|withdraw|ACH)
    auto_debit_pattern = re.search(
        r"(authorize|permission|grant|allow).{0,50}(debit|withdraw|ACH|bank account)",
        text,
        re.IGNORECASE,
    )

    # Only flag if pattern found AND no optional language
    features["has_auto_debit"] = (
        1 if (auto_debit_pattern and not has_optional_language) else 0
    )

    # === Continuous Debit Detection with Negation Shield ===
    # Check for continuous debit patterns
    continuous_debit_patterns = [
        r"repeatedly debit",
        r"continuous.*authorization",
        r"debit.*repeatedly",
        r"until paid",
        r"multiple.*withdrawals",
        r"at any time",
    ]

    # Negation words that indicate SAFE context
    negation_words = [
        r"no continuous",
        r"no blanket",
        r"does not authorize",
        r"not authorize",
        r"not authorized",
        r"may not initiate",
        r"except for scheduled",
        r"only scheduled",
        r"optional autopay",
        r"opt in",
        r"can cancel",
        r"can opt out",
        r"may revoke",
    ]

    # Find continuous debit pattern
    continuous_match = None
    for pattern in continuous_debit_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            continuous_match = match
            break

    # If pattern found, check for negations in nearby context (±150 chars)
    has_continuous_debit = 0
    if continuous_match:
        match_start = continuous_match.start()
        match_end = continuous_match.end()

        # Extract context window around the match
        context_start = max(0, match_start - 150)
        context_end = min(len(text), match_end + 150)
        context = text[context_start:context_end]

        # Check if any negation words appear in context
        has_negation = False
        for negation in negation_words:
            if re.search(negation, context, re.IGNORECASE):
                has_negation = True
                break

        # Only flag if NO negation found
        if not has_negation:
            has_continuous_debit = 1

    features["has_continuous_debit"] = has_continuous_debit

    features["has_wage_assignment"] = has_pattern(
        text, [r"wage assignment", r"paycheck.*assignment"]
    )

    features["has_arbitration"] = has_pattern(
        text, [r"arbitration", r"binding arbitration"]
    )

    features["has_class_action_waiver"] = has_pattern(
        text, [r"class action waiver", r"waive.*class action", r"no class action"]
    )

    features["has_jury_waiver"] = has_pattern(
        text, [r"jury.*waiver", r"waive.*jury", r"no jury trial"]
    )

    features["has_confession_of_judgment"] = has_pattern(
        text, [r"confession of judgment", r"confess.*judgment"]
    )

    features["has_employer_contact"] = has_pattern(
        text, [r"contact.*employer", r"employer.*collection"]
    )

    # === Transparency Features ===
    features["has_clear_disclosure"] = has_pattern(
        text, [r"APR.*disclosed", r"fee schedule.*included", r"clearly.*disclosed"]
    )

    features["has_transparency_language"] = has_pattern(
        text,
        [r"transparency", r"disclosure", r"right to sue", r"may revoke", r"can cancel"],
    )

    features["has_fee_ambiguity"] = has_pattern(
        text,
        [
            r"fees may apply",
            r"may change without notice",
            r"see external schedule",
            r"additional fees",
        ],
    )

    # === Document Statistics ===
    features["doc_length_words"] = len(text.split())
    features["num_money_amounts"] = len(re.findall(r"\$[0-9,]+", text))
    features["num_percentages"] = len(re.findall(r"[0-9]+\.?[0-9]*%", text))

    # === Risk Ratios ===
    if apr > 0 and term > 0:
        features["apr_to_term_ratio"] = apr / term
    else:
        features["apr_to_term_ratio"] = 0

    return features


# === ML Inference ===

_model = None
_schema = None


def load_model_and_schema():
    """Load trained model and feature schema."""
    global _model, _schema

    if _model is not None and _schema is not None:
        return _model, _schema

    try:
        model_path = (
            Path(__file__).parent.parent / "model" / "models" / "loanshark_model.joblib"
        )
        schema_path = (
            Path(__file__).parent.parent / "model" / "models" / "feature_schema.json"
        )

        _model = joblib.load(model_path)
        with open(schema_path, "r") as f:
            _schema = json.load(f)

        return _model, _schema
    except Exception as e:
        print(f"⚠ Error loading model: {e}")
        return None, None


def predict_ml(text, model=None, schema=None):
    """Get ML prediction for loan text."""
    if model is None or schema is None:
        model, schema = load_model_and_schema()

    if model is None:
        return None

    features_dict = extract_features(text)

    # Convert to feature vector in correct order
    feature_vector = [features_dict.get(name, 0) for name in schema["feature_names"]]
    feature_vector = np.array(feature_vector).reshape(1, -1)

    try:
        prob = model.predict_proba(feature_vector)[0][1]
        ml_score = round(prob * 100)
        return {"ml_prob": prob, "ml_score": ml_score, "features": features_dict}
    except Exception as e:
        print(f"⚠ Prediction error: {e}")
        return None


# === Scoring Logic ===


def calculate_rule_score(features):
    """Calculate rule-based score (0-100) with hackathon-grade weights."""
    score = 0

    # === Cost Points (max 40) ===
    apr = features.get("apr_value", 0)
    apr_missing = features.get("apr_missing", 0)

    if apr_missing:
        score += 15  # Transparency penalty
    elif apr >= 300:
        score += 40
    elif apr >= 100:
        score += 25
    elif apr >= 36:
        score += 10

    # === Fees Points (max 20) ===
    if features.get("mentions_per_100", 0):
        score += 20  # "$X per $100" is extremely predatory
    elif (
        features.get("service_fee_value", 0) > 0
        or features.get("origination_fee_value", 0) > 0
    ):
        score += 5

    if features.get("has_fee_ambiguity", 0):
        score += 10  # "fees may apply" / "may change"

    # === Debt Cycle Points (max 20) ===
    if features.get("has_rollover_or_renewal", 0):
        score += 20  # Rollover/renewal is a major trap

    if features.get("has_balloon_payment", 0):
        score += 10

    if features.get("term_very_short", 0):
        score += 10  # 14 days or less

    # === Legal/Collection Traps (max 20) ===
    if features.get("has_confession_of_judgment", 0):
        score += 20  # Extremely predatory

    if features.get("has_wage_assignment", 0):
        score += 15

    if features.get("has_arbitration", 0):
        score += 10

    if features.get("has_class_action_waiver", 0):
        score += 10

    if features.get("has_jury_waiver", 0):
        score += 5

    if features.get("has_continuous_debit", 0) or features.get("has_auto_debit", 0):
        score += 10

    if features.get("has_employer_contact", 0):
        score += 7

    # Don't reduce score for positive signals - only penalties
    # (Removed negative adjustments to avoid false "Safe" labels)

    return min(100, score)  # Clamp to 100 max


def calculate_confidence(features):
    """Calculate confidence score based on extraction quality and text completeness."""
    confidence_score = 100

    # Critical missing information
    if features.get("apr_missing", 0):
        confidence_score -= 25  # APR is critical
    if features.get("term_days", 0) == 0:
        confidence_score -= 15  # Term is important

    # Document quality indicators
    doc_length = features.get("doc_length_words", 0)
    if doc_length < 30:
        confidence_score -= 30  # Very short, likely incomplete
    elif doc_length < 50:
        confidence_score -= 20  # Short, may be missing context
    elif doc_length < 100:
        confidence_score -= 10  # Moderate length

    # Financial indicators present (good sign)
    num_money = features.get("num_money_amounts", 0)
    num_percent = features.get("num_percentages", 0)

    if num_money == 0 and num_percent == 0:
        confidence_score -= 20  # No financial data at all
    elif num_money < 2 and num_percent < 1:
        confidence_score -= 10  # Minimal financial data

    # Fee information completeness
    if features.get("fee_word_count", 0) < 2:
        confidence_score -= 10  # Very little fee information

    # Ensure score is in valid range
    confidence_score = max(0, min(100, confidence_score))

    # Map to label
    if confidence_score >= 75:
        return "High"
    elif confidence_score >= 45:
        return "Medium"
    else:
        return "Low"


def hybrid_score(text, ml_result=None):
    """Calculate final hybrid score combining rules + ML."""
    features = extract_features(text)
    rule_score = calculate_rule_score(features)
    confidence = calculate_confidence(features)

    if ml_result is None:
        ml_result = predict_ml(text)

    if ml_result is None:
        final_score = rule_score
        ml_score = None
        ml_prob = None
    else:
        ml_score = ml_result["ml_score"]
        ml_prob = ml_result["ml_prob"]

        # Adaptive weighting
        if features.get("apr_missing", 0) and features.get("fee_word_count", 0) < 3:
            rule_weight = 0.9
            ml_weight = 0.1
        elif confidence == "High":
            rule_weight = 0.5
            ml_weight = 0.5
        else:
            rule_weight = 0.6
            ml_weight = 0.4

        final_score = round(rule_weight * rule_score + ml_weight * ml_score)

        # Prevent ML from reducing score too much below rule score
        # (ML shouldn't override obvious rule-based detections)
        if rule_score > 20:
            final_score = max(final_score, int(rule_score * 0.7))

    # Hard floor rules for score
    apr = features.get("apr_value", 0)
    if apr > 400:
        final_score = max(final_score, 85)
    if (
        features.get("has_arbitration", 0)
        and features.get("has_class_action_waiver", 0)
        and apr > 100
    ):
        final_score = max(final_score, 75)

    # Map score to label
    if final_score <= 20:
        label = "Safe"
    elif final_score <= 50:
        label = "Caution"
    elif final_score <= 80:
        label = "High Risk"
    else:
        label = "Predatory"

    # === LABEL FLOOR RULES (prevent false "Safe" labels) ===
    # If any legal trap exists, minimum = Caution
    if (
        features.get("has_arbitration", 0)
        or features.get("has_class_action_waiver", 0)
        or features.get("has_confession_of_judgment", 0)
    ):
        if label == "Safe":
            label = "Caution"

    # If major predatory signals, minimum = High Risk
    if (
        features.get("has_rollover_or_renewal", 0)
        or features.get("mentions_per_100", 0)
        or apr >= 100
        or features.get("term_very_short", 0)
    ):
        if label in ["Safe", "Caution"]:
            label = "High Risk"

    # If extreme predatory combo, minimum = Predatory
    if apr >= 300 and (
        features.get("has_rollover_or_renewal", 0)
        or features.get("has_arbitration", 0)
        or features.get("has_continuous_debit", 0)
    ):
        label = "Predatory"

    return {
        "score": final_score,
        "label": label,
        "confidence": confidence,
        "rule_score": rule_score,
        "ml_score": ml_score,
        "ml_prob": ml_prob,
        "features": features,
    }


# === Explanations ===


def generate_reasons(features):
    """Generate priority-based reasons for the risk score."""
    reasons = []

    apr = features.get("apr_value", 0)

    # Priority 1: Extreme APR
    if apr > 300:
        reasons.append(f"APR is {apr:.0f}%, which is extremely high and predatory.")
    elif apr > 100:
        reasons.append(
            f"APR is {apr:.0f}%, significantly above typical rates (36% is considered high)."
        )
    elif apr > 50:
        reasons.append(
            f"APR is {apr:.0f}%, which is elevated compared to standard loans."
        )

    # Priority 2: Fee structure
    if features.get("mentions_per_100", 0):
        reasons.append(
            "Fees charged per $100 borrowed compound quickly on short-term loans."
        )

    # Priority 3: Debt cycle
    if features.get("has_rollover_or_renewal", 0):
        reasons.append(
            "Loan includes rollover/renewal clauses that can trap borrowers in debt cycles."
        )

    if features.get("term_very_short", 0):
        reasons.append(
            "Very short repayment term (14 days or less) makes it difficult to repay without rolling over."
        )

    # Priority 4: Legal traps
    if features.get("has_arbitration", 0) and features.get(
        "has_class_action_waiver", 0
    ):
        reasons.append(
            "Mandatory arbitration + class action waiver severely limits your legal rights."
        )
    elif features.get("has_arbitration", 0):
        reasons.append(
            "Mandatory arbitration clause found (you waive your right to sue in court)."
        )
    elif features.get("has_class_action_waiver", 0):
        reasons.append("Class action waiver prevents you from joining group lawsuits.")

    # Priority 5: Payment access
    if features.get("has_continuous_debit", 0):
        reasons.append(
            "Lender can repeatedly debit your account, risking overdraft fees and loss of control."
        )
    elif features.get("has_auto_debit", 0):
        reasons.append(
            "Automatic debit authorization may make it difficult to manage payments."
        )

    # Priority 6: Collection tactics
    if features.get("has_employer_contact", 0):
        reasons.append(
            "Lender may contact your employer for collection, risking your job."
        )

    if features.get("has_wage_assignment", 0):
        reasons.append("Wage assignment gives lender direct access to your paycheck.")

    # Only add "no red flags" if score is actually low AND no legal traps
    if (
        len(reasons) == 0
        and apr < 36
        and not features.get("has_arbitration", 0)
        and not features.get("has_class_action_waiver", 0)
    ):
        reasons.append("No major red flags detected in this contract.")

    return reasons[:5]


def extract_highlights(text, features):
    """Extract highlighted snippets from the contract with clean boundaries."""
    highlights = []

    def clean_snippet(snippet):
        """Clean snippet: replace newlines, trim whitespace, ensure word boundaries."""
        # Replace newlines with spaces
        snippet = snippet.replace("\n", " ").replace("\r", " ")
        # Collapse multiple spaces
        snippet = re.sub(r"\s+", " ", snippet)
        # Trim
        snippet = snippet.strip()
        # Ensure it ends at a word boundary (not mid-word)
        if len(snippet) > 80:
            # Find last space before position 80
            last_space = snippet[:80].rfind(" ")
            if last_space > 60:
                snippet = snippet[:last_space] + "..."
        return snippet

    # APR highlight
    apr_match = re.search(r"(APR[:\s]+[0-9]+\.?[0-9]*%)", text, re.IGNORECASE)
    if apr_match and features.get("apr_value", 0) > 100:
        highlights.append(
            {"text": clean_snippet(apr_match.group(1)), "category": "ExcessiveCost"}
        )

    # Fee per $100 pattern
    per100_match = re.search(
        r"(\$[0-9]+\s*per\s*\$100[^\n]{0,60})", text, re.IGNORECASE
    )
    if per100_match:
        highlights.append(
            {
                "text": clean_snippet(per100_match.group(1)),
                "category": "ExcessiveCost",
            }
        )

    # Arbitration - always add if detected
    if features.get("has_arbitration", 0):
        arb_match = re.search(
            r"([^\n]{0,30}(?:binding )?arbitration[^\n]{0,50})", text, re.IGNORECASE
        )
        if arb_match:
            highlights.append(
                {"text": clean_snippet(arb_match.group(1)), "category": "LegalTrap"}
            )

    # Class action waiver
    if features.get("has_class_action_waiver", 0):
        class_match = re.search(
            r"([^\n]{0,20}class action waiver[^\n]{0,30})", text, re.IGNORECASE
        )
        if class_match:
            highlights.append(
                {"text": clean_snippet(class_match.group(1)), "category": "LegalTrap"}
            )

    # Rollover/renewal
    if features.get("has_rollover_or_renewal", 0):
        rollover_match = re.search(
            r"([^\n]{0,20}(?:automatically renew|rollover|may be renewed|renew)[^\n]{0,50})",
            text,
            re.IGNORECASE,
        )
        if rollover_match:
            highlights.append(
                {
                    "text": clean_snippet(rollover_match.group(1)),
                    "category": "DebtCycle",
                }
            )

    # Continuous debit - only extract if feature is flagged (negation shield already applied in feature detection)
    if features.get("has_continuous_debit", 0):
        # Look for positive lender action signals (not negations)
        debit_match = re.search(
            r"([^\n]{0,30}(?:authorizes? lender|lender may|initiate.*debit|repeatedly debit|multiple.*withdrawal|until paid)[^\n]{0,50})",
            text,
            re.IGNORECASE,
        )
        if debit_match:
            snippet = debit_match.group(1)
            # Double-check this specific snippet doesn't contain negations
            if not re.search(
                r"(\bno\b|\bnot\b|does not|may not)", snippet, re.IGNORECASE
            ):
                highlights.append(
                    {
                        "text": clean_snippet(snippet),
                        "category": "PaymentAccess",
                    }
                )

    # Auto-debit (only if detected - more strict now)
    if features.get("has_auto_debit", 0):
        auto_debit_match = re.search(
            r"([^\n]{0,30}(?:authorize|permission|grant)[^\n]{0,30}(?:debit|withdraw|ACH|bank account)[^\n]{0,40})",
            text,
            re.IGNORECASE,
        )
        if auto_debit_match:
            highlights.append(
                {
                    "text": clean_snippet(auto_debit_match.group(1)),
                    "category": "PaymentAccess",
                }
            )

    # Employer contact
    if features.get("has_employer_contact", 0):
        employer_match = re.search(
            r"([^\n]{0,20}contact.*employer[^\n]{0,30})", text, re.IGNORECASE
        )
        if employer_match:
            highlights.append(
                {
                    "text": clean_snippet(employer_match.group(1)),
                    "category": "Collection",
                }
            )

    # Deduplicate highlights by (category, text)
    seen = set()
    unique_highlights = []
    for h in highlights:
        key = (h["category"], h["text"])
        if key not in seen:
            seen.add(key)
            unique_highlights.append(h)

    return unique_highlights[:6]


def analyze_loan(text):
    """Complete analysis pipeline - returns API-ready response."""
    result = hybrid_score(text)
    reasons = generate_reasons(result["features"])
    highlights = extract_highlights(text, result["features"])

    response = {
        "score": result["score"],
        "label": result["label"],
        "confidence": result["confidence"],
        "reasons": reasons,
        "highlights": highlights,
        "debug": {
            "rule_score": result["rule_score"],
            "ml_score": result["ml_score"],
            "ml_prob": result["ml_prob"],
        },
    }

    return response
