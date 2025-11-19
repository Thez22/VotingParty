import React from "react";
import styles from "../styles/TrackList.module.css";

export type TrackItem = {
  id: string;
  title: string;
  artist: string;
  votes: number;
};

type Props = {
  tracks: TrackItem[];
  onVote?: (trackId: string) => void;
  showVotes?: boolean;
};

export default function TrackList({ tracks, onVote, showVotes = true }: Props) {
  if (!tracks.length) {
    return <p className={styles.empty}>Aucune proposition pour le moment.</p>;
  }
  return (
    <ul className={styles.list}>
      {tracks.map((track) => (
        <li key={track.id} className={styles.item}>
          <div>
            <strong>{track.title}</strong>
            <p className={styles.artist}>{track.artist}</p>
          </div>
          {showVotes && <span className={styles.votes}>{track.votes} votes</span>}
          {onVote && (
            <button className={styles.voteButton} onClick={() => onVote(track.id)}>
              Voter
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
