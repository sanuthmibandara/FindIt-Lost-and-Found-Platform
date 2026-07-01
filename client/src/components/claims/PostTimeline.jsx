import "./PostTimeline.css";

function formatTimelineDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PostTimeline({ timeline = [] }) {
  if (!timeline.length) return null;

  return (
    <div className="post-timeline">
      <h3>Activity</h3>
      <ul className="timeline-list">
        {timeline.map((event, index) => (
          <li
            key={event.key}
            className={`timeline-item ${event.completed ? "completed" : "pending"} ${
              index === timeline.length - 1 ? "last" : ""
            }`}
          >
            <span className="timeline-dot" />
            <div className="timeline-content">
              <span className="timeline-label">{event.label}</span>
              {event.date && (
                <span className="timeline-date">{formatTimelineDate(event.date)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PostTimeline;
