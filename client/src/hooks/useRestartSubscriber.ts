import useConfigure from "./useConfigure";
import useOffer from "./useOffer"

const useRestartSubscriber = () => {
  const configure = useConfigure();

  const restartSubscriber = async (feed: number) => {
    configure(feed, null, true, undefined, undefined);
  }

  return restartSubscriber;
}

export default useRestartSubscriber;