import { selectFocusChannel } from "../slices/channelSlice";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";

interface ChannelPopupRoamProps {
}

const ChannelPopupRoam: React.FC<ChannelPopupRoamProps> = ({  }) => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  return (
    <div>
      
    </div>
  );
};

export default ChannelPopupRoam;