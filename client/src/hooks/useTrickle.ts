import { gql, useMutation } from "@apollo/client";

const TRICKLE = gql`
  mutation Trickle( $feed: Int!, $candidate: CandidateInput!) {
    trickle( feed: $feed, candidate: $candidate)
  }
`;

const TRICKLE_COMPLETE = gql`
  mutation TrickleComplete($feed: Int!, $candidate: CandidateInput) {
    trickleComplete(feed: $feed, candidate: $candidate)
  }
`;

const useTrickle = () => {
  const [trickle] = useMutation(TRICKLE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      //console.log(data);
    },
  });

  const [trickleComplete] = useMutation(TRICKLE_COMPLETE, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      //console.log(data);
    },
  });

  const trickler = (feed: number, candidate: any) => {
    if (candidate) {
      trickle({ variables: { feed, candidate } });
    }
    else {
      trickleComplete({ variables: { feed } });
    }
  };

  return trickler;
}

export default useTrickle;