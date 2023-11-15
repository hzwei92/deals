import { gql, useMutation } from "@apollo/client";
import { POST_FIELDS } from "../fragments/post";
import { useAppDispatch } from "../store";
import { addPosts } from "../slices/postSlice";
import { USER_FIELDS } from "../fragments/user";

const GET_CHANNEL_MEMBERSHIPS = gql`
  mutation GetChannelPosts($channelId: Int!, $createdAt: String) {
    getChannelPosts(channelId: $channelId, createdAt: $createdAt) {
      ...PostFields
      user {
        id
        name
        email
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

  const getChannelPosts = (channelId: number, createdAt?: string) => {
    get({
      variables: {
        channelId,
        createdAt,
      }
    });
  };

  return getChannelPosts
}

export default useGetChannelPosts;