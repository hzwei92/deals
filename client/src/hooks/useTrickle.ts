import { gql, useMutation } from "@apollo/client";

const TRICKLE = gql`
  mutation Trickle($channelId: Int!, $candidate: CandidateInput!, $feed: Float!) {
    trickle(channelId: $channelId, candidate: $candidate, feed: $feed)
  }
`;

const TRICKLE_COMPLETE = gql`
  mutation TrickleComplete($channelId: Int!, $feed: Float!) {
    trickleComplete(channelId: $channelId, feed: $feed)
  }
`;

const useTrickle = () => {
  const [trickle] = useMutation(TRICKLE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const [trickleComplete] = useMutation(TRICKLE_COMPLETE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
    },
  });

  const trickler = (channelId: number, feed: number, candidate: any) => {
    if (candidate) {
      console.log('trickle', feed)
      trickle({ variables: { channelId, feed, candidate } });
    }
    else {
      trickleComplete({ variables: { channelId, feed } });
    }
  };

  return trickler;
}

export default useTrickle;