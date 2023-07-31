import useConfigure from "./useConfigure";
import useOffer from "./useOffer"

const useRestartPublisher = () => {
  const doOffer = useOffer();
  const configure = useConfigure();

  const restartPublisher = async (feed: number) => {
    const offer = await doOffer(feed, '');
    configure(feed, offer, false, undefined, undefined);
  }

  return restartPublisher;
}

export default useRestartPublisher;