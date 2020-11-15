import { PubSubEvent } from "pkg/pubsub/index";
import { DependencyList, useEffect, useRef } from "react";
import { useGame } from "snowtail/engine/use-game";

export function usePubsubEvent<T extends PubSubEvent>(
  eventName: T["name"],
  callback: (data: T["data"]) => T["data"],
  deps: DependencyList = [],
) {
  const callbackRef = useRef(callback);
  const { subscribe } = useGame();

  useEffect(() => {
    return subscribe(eventName, callbackRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, eventName, ...deps]);
}
