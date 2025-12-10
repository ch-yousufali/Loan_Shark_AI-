interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => (
  <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 flex justify-between items-center">
    <span>🚨 {message}</span>
    <button onClick={onDismiss} className="text-red-300 hover:text-red-100">✕</button>
  </div>
);