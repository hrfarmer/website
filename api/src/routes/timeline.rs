use actix_web::{HttpResponse, Responder, web};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GithubTimelineEvent {
    pub event_type: GithubEventType,
    pub url: String,
    pub event_time: u64,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub pr_number: Option<u32>,
    pub repo: String,
    pub lines_added: u32,
    pub lines_removed: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "lowercase")]
pub enum GithubEventType {
    Commit,
    Pr,
}

#[derive(Serialize)]
#[serde(tag = "type", content = "data", rename_all = "lowercase")]
pub enum TimelineItem {
    Github(GithubTimelineEvent),
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.route("/timeline", web::get().to(get_timeline));
}

async fn get_timeline() -> impl Responder {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    // Example data - replace with real data fetching logic
    let timeline: Vec<TimelineItem> = vec![
        TimelineItem::Github(GithubTimelineEvent {
            event_type: GithubEventType::Commit,
            url: "https://github.com/example/repo/commit/abc123".to_string(),
            event_time: now,
            name: "real commit".to_string(),
            pr_number: None,
            repo: "proves-core-reference".to_string(),
            lines_added: 112,
            lines_removed: 13,
        }),
        TimelineItem::Github(GithubTimelineEvent {
            event_type: GithubEventType::Pr,
            url: "https://github.com/example/repo/pull/56".to_string(),
            event_time: now,
            name: "real cool and epic pr".to_string(),
            pr_number: Some(56),
            repo: "proves-core-reference".to_string(),
            lines_added: 112,
            lines_removed: 13,
        }),
    ];

    HttpResponse::Ok().json(timeline)
}
