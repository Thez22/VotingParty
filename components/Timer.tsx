import React, { useEffect, useState } from "react";
import { formatTimeLeft } from "../lib/utils";

type Props = {
  endTime: number;
  onComplete?: () => void;
};

export default function Timer({ endTime, onComplete }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (endTime && now >= endTime && onComplete) {
      onComplete();
    }
  }, [endTime, now, onComplete]);

  if (!endTime) {
    return null;
  }

  return <p>Temps restant : {formatTimeLeft(endTime - now)}</p>;
}
