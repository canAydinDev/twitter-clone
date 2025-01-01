import { fetchUserAction } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import UserCard from "../cards/UserCard";

const RightSideBar = async () => {
  const user = await currentUser();
  if (!user) return null;

  const similarMinds = await fetchUserAction({
    userId: user.id,
    pageSize: 4,
  });
  if (!similarMinds) return <></>;
  //hello
  return (
    <>
      <section className="custom-scrollbar rightsidebar">
        <div className="flex flex-1 flex-col justify-start">
          <h3 className="text-heading4-medium text-light-1">Suggestions</h3>
        </div>
        <div className="flex flex-col flex-1 justify-start">
          <h3 className="text-heading4-medium text-light-1">Groups</h3>
        </div>

        <div className="flex flex-col flex-1 justify-start">
          <h3 className="text-heading4-medium text-light-1">Users</h3>
          <div className="mt-7 flex w-[350px] flex-col gap-10">
            {similarMinds.users?.length > 0 ? (
              <>
                {similarMinds.users.map((person) => (
                  <UserCard
                    key={person.id}
                    id={person.id}
                    name={person.name}
                    username={person.name}
                    imgUrl={person.image}
                  />
                ))}
              </>
            ) : (
              <>
                <p className="text-base-regular text-light-3">No Users yet</p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default RightSideBar;
