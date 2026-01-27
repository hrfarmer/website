import { FiGitCommit } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import { IoGitPullRequestOutline } from "react-icons/io5";
import { SiValorant } from "react-icons/si";

type GithubTimelineEvent = {
  eventType: "commit" | "pr";
  url: string;
  eventTime: number;
  name: string;
  prNumber?: number;
  repo: string;
  linesAdded: number;
  linesRemoved: number;
};

type ValorantTimelineEvent = {
  url: string;
  eventTime: number;
  mapName: string;
  kda: [number, number, number];
  result: "w" | "l" | "d";
  score: [number, number];
  rank: string;
  rr: number;
};

type TimelineData = Array<
  | {
      type: "github";
      data: GithubTimelineEvent;
    }
  | {
      type: "valorant";
      data: ValorantTimelineEvent;
    }
>;

export default function Timeline() {
  const data: TimelineData = [
    {
      type: "github",
      data: {
        eventType: "commit",
        url: "",
        eventTime: Date.now(),
        name: "real commit",
        repo: "proves-core-reference",
        linesAdded: 112,
        linesRemoved: 13,
      },
    },
    {
      type: "github",
      data: {
        eventType: "pr",
        url: "",
        eventTime: Date.now(),
        name: "real cool and epic pr",
        prNumber: 56,
        repo: "proves-core-reference",
        linesAdded: 112,
        linesRemoved: 13,
      },
    },
    {
      type: "valorant",
      data: {
        url: "",
        eventTime: Date.now(),
        mapName: "Bind",
        kda: [21, 12, 4],
        result: "w",
        score: [13, 6],
        rank: "DIAMOND 1",
        rr: 24,
      },
    },
  ];

  return (
    <div className="w-132 h-165 p-6 flex flex-col border border-neutral-800 bg-neutral-950">
      {data.map((i) => {
        if (i.type === "github") {
          return <GithubTimelineItem item={i.data} />;
        } else if (i.type === "valorant") {
          return <ValorantTimelineItem item={i.data} />;
        }
      })}
    </div>
  );
}

function IconWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-700/30 border border-neutral-800 rounded-full w-12 h-12 flex items-center justify-center">
      {children}
    </div>
  );
}

function TimelineItemWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-neutral-200">{children}</div>
  );
}

function GithubTimelineItem({ item }: { item: GithubTimelineEvent }) {
  if (item.eventType === "commit")
    return (
      <TimelineItemWrapper>
        <IconWrapper>
          <FiGitCommit size={20} />
        </IconWrapper>
        <div>
          <p>{item.name}</p>
          <p className="text-xs text-neutral-400">{item.repo} | 5s</p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-green-500">+{item.linesAdded}</p>
            <p className="text-sm text-red-500">-{item.linesRemoved}</p>
          </div>
          <a href={item.url}>
            <MdArrowOutward size={20} />
          </a>
        </div>
      </TimelineItemWrapper>
    );

  if (item.eventType === "pr") {
    return (
      <TimelineItemWrapper>
        <IconWrapper>
          <IoGitPullRequestOutline size={20} />
        </IconWrapper>
        <div>
          <p>
            <span className="text-neutral-400">#{item.prNumber}</span>{" "}
            {item.name}
          </p>
          <p className="text-xs text-neutral-400">{item.repo} | 12m</p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-green-500">+{item.linesAdded}</p>
            <p className="text-sm text-red-500">-{item.linesRemoved}</p>
          </div>
          <a href={item.url}>
            <MdArrowOutward size={20} />
          </a>
        </div>
      </TimelineItemWrapper>
    );
  }
}

function ValorantTimelineItem({ item }: { item: ValorantTimelineEvent }) {
  return (
    <TimelineItemWrapper>
      <IconWrapper>
        <SiValorant size={20} />
      </IconWrapper>
      <div>
        <p>{item.mapName}</p>
        <p className="text-xs text-neutral-400">
          {item.kda[0]}/{item.kda[1]}/{item.kda[2]} | 24m
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <p className="text-green-500">
          {item.result === "w"
            ? "VICTORY"
            : item.result === "l"
              ? "LOSS"
              : "DRAW"}
        </p>
        <p className="text-sm text-neutral-400">
          {item.score[0]}-{item.score[1]}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <p className="text-sm text-pink-400">{item.rank}</p>
          <p className="text-sm text-green-500">
            {item.rr >= 0 ? "+" : "-"}
            {item.rr} RR
          </p>
        </div>
        <a href={item.url}>
          <MdArrowOutward size={20} />
        </a>
      </div>
    </TimelineItemWrapper>
  );
}
