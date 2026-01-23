import { FiGitCommit } from "react-icons/fi";
import { MdArrowOutward } from "react-icons/md";
import { IoGitPullRequestOutline } from "react-icons/io5";
import { SiValorant } from "react-icons/si";

export default function Timeline() {
  return (
    <div className="w-132 h-165 p-6 flex flex-col border border-neutral-800 bg-neutral-950">
      <GithubTimelineItem itemType="commit" />
      <GithubTimelineItem itemType="pr" />
      <ValorantTimelineItem />
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

function GithubTimelineItem({ itemType }: { itemType: "commit" | "pr" }) {
  if (itemType === "commit")
    return (
      <TimelineItemWrapper>
        <IconWrapper>
          <FiGitCommit size={20} />
        </IconWrapper>
        <div>
          <p>commit name</p>
          <p className="text-xs text-neutral-400">repo name | 5s</p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-green-500">+112</p>
            <p className="text-sm text-red-500">-13</p>
          </div>
          <a>
            <MdArrowOutward size={20} />
          </a>
        </div>
      </TimelineItemWrapper>
    );

  if (itemType === "pr") {
    return (
      <TimelineItemWrapper>
        <IconWrapper>
          <IoGitPullRequestOutline size={20} />
        </IconWrapper>
        <div>
          <p>
            <span className="text-neutral-400">#56</span> pr name
          </p>
          <p className="text-xs text-neutral-400">repo name | 12m</p>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-green-500">+112</p>
            <p className="text-sm text-red-500">-13</p>
          </div>
          <a>
            <MdArrowOutward size={20} />
          </a>
        </div>
      </TimelineItemWrapper>
    );
  }
}

function ValorantTimelineItem() {
  return (
    <TimelineItemWrapper>
      <IconWrapper>
        <SiValorant size={20} />
      </IconWrapper>
      <div>
        <p>Bind</p>
        <p className="text-xs text-neutral-400">21/12/4 | 24m</p>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <p className="text-green-500">VICTORY</p>
        <p className="text-sm text-neutral-400">13-6</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <p className="text-sm text-pink-400">DIAMOND 1</p>
          <p className="text-sm text-green-500">+24 RR</p>
        </div>
        <a>
          <MdArrowOutward size={20} />
        </a>
      </div>
    </TimelineItemWrapper>
  );
}
