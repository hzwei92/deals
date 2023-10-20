import { gql, useMutation } from "@apollo/client";
import { POST_FIELDS } from "../fragments/post";
import { useAppDispatch } from "../store";
import { addPosts } from "../slices/postSlice";
import { USER_FIELDS } from "../fragments/user";

const GET_CHANNEL_MEMBERSHIPS = gql`
  mutation GetChannelPosts($channelId: Int!) {
    getChannelPosts(channelId: $channelId) {
      ...PostFields
      user {
        id
        name
      }
    }
  }
  ${POST_FIELDS}
`;

const useGetChannelPosts = () => {
  const dispatch = useAppDispatch();
  const [get] = useMutation(GET_CHANNEL_MEMBERSHIPS, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addPosts(data.getChannelPosts));
    },
  });

  const getChannelPosts = (channelId: number) => {
    get({
      variables: {
        channelId,
      }
    });
  };

  return getChannelPosts
}

export default useGetChannelPosts;