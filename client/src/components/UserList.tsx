import { IonAvatar, IonCard, IonIcon } from "@ionic/react";
import { selectAppUser, selectUsers } from "../slices/userSlice";
import { useAppSelector } from "../store";
import { Membership } from "../types/Membership";
import { Channel } from "../types/Channel";
import { flashOutline, videocamOutline } from "ionicons/icons";
import md5 from "md5";

interface UserListProps {
  channel: Channel;
  channelMemberships: Membership[];
}

const UserList: React.FC<UserListProps> = ({ channel, channelMemberships }) => {
  const user = useAppSelector(selectAppUser);

  const users = useAppSelector(selectUsers);

  return (
    <div style={{
      marginTop: 10,
      width: 220,
      maxHeight: 200,
      overflowY: 'scroll',
    }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: 2,
    }}>
      {
        channelMemberships
          .sort((a: Membership, b: Membership) => {
            if (a.userId ===  user?.id) return -1;
            if (b.userId === user?.id) return 1;
            if (a.isActive && !b.isActive) return -1;
            if (!a.isActive && b.isActive) return 1;
            return a.createdAt < b.createdAt ? -1 : 1;
          })
          .map((membership: Membership) => {
            return (
              <IonCard key={membership.id} style={{
                margin: 0,
                marginBottom: 5,
                padding: 5,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'start',
                  fontSize: 12,
                }}>
                  <IonAvatar style={{
                    paddingTop: 1,
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                  }}>
                    <img src={`https://www.gravatar.com/avatar/${md5(users[membership.userId].email || '')}?d=retro`} />
                  </IonAvatar>
                  <div style={{
                    paddingLeft: 5,
                    width: 170,
                  }}>
                    { users[membership.userId].name }
                    {
                      membership.userId === channel.ownerId 
                        ? <IonIcon icon={flashOutline} style={{
                            paddingTop: 3,
                            paddingLeft: 3,
                            color: 'var(--ion-color-primary)'
                          }}/>
                        : null
                    }
                  </div>
                </div>
                <div style={{
                }}>
                  {
                    membership.isActive 
                      ? <IonIcon icon={videocamOutline} style={{
                          marginTop: 2,
                          marginLeft: 2,
                          color: 'green'
                        }}/>
                      : null
                  }
                </div>
              </IonCard>
            )
          })
      }
    </div>
    </div>
  )
}


export default UserList;