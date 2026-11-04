import "./Backlog.css";

const BACKLOG = [
  {
    title: "Contact messages",
    status: "Backend work needed",
    description: "The public website stores ContactMessage records, but there is no protected admin API to list, read, or update their status. No panel request or inbox UI has been added.",
  },
  {
    title: "Newsletter subscribers",
    status: "Backend work needed",
    description: "NewsletterSubscriber records currently have no protected admin list or export API. Subscriber management remains excluded until those endpoints exist.",
  },
];

export default function Backlog() {
  return (
    <div className="backlog-page">
      <header><span>Product planning</span><h1>Backend backlog</h1><p>Features intentionally left out of the admin panel until read APIs are available.</p></header>
      <div className="backlog-list">
        {BACKLOG.map((item) => <article key={item.title}><div><h2>{item.title}</h2><p>{item.description}</p></div><span>{item.status}</span></article>)}
      </div>
      <aside><strong>Admin account deletion</strong><p>Account deletion is intentionally not offered in this panel.</p></aside>
    </div>
  );
}
