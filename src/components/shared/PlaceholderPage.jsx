import './PlaceholderPage.css';

export default function PlaceholderPage({ title, message }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <h1>{title}</h1>
        <p>{message || 'This feature is coming soon.'}</p>
      </div>
    </div>
  );
}
