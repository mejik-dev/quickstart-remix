import { Form, Link, useLoaderData } from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { microgenApiUrl } from '~/lib/microgen.server';
import { getToken, microgenToken } from '~/utils/cookie';

export const action = async () => {
  return redirect('/', {
    headers: {
      'Set-Cookie': await microgenToken.serialize('', {
        maxAge: 0,
      }),
    },
  });
};

export const loader = async ({ params, request }) => {
  const { username } = params;
  const token = await getToken(request);

  const response = await fetch(
    `${microgenApiUrl}/Users?$lookup=*&username=${username}`
  );

  const authUserResponse = await fetch(`${microgenApiUrl}/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const authUser = await authUserResponse.json();

  let isOwnProfile;

  if (authUser) {
    isOwnProfile = authUser.username === username;
  }

  const user = await response.json();

  return json({
    isOwnProfile,
    user,
  });
};

const Profile = () => {
  const loaderData = useLoaderData();
  const [user, setUser] = React.useState('');

  React.useEffect(() => {
    if (loaderData?.user) {
      setUser(loaderData.user?.[0]);
    }
  }, [loaderData]);

  return (
    <>
      {user && (
        <div className="profile-page">
          {loaderData?.isOwnProfile && (
            <div className="button-top">
              <Link className="button" to="/profile">
                Edit Profile
              </Link>
              <Form method="post">
                <button>Logout</button>
              </Form>
            </div>
          )}
          <div className="profile-wrapper">
            <div className="profile-header">
              <img
                className="image-avatar"
                width={90}
                height={90}
                src={
                  user.profile?.[0]?.image ?? 'https://via.placeholder.com/90'
                }
                alt=""
              />
              <h3 className="profile-title">
                <span>{user.firstName}</span> <span>{user.lastName ?? ''}</span>
              </h3>
              <p>{user.profile?.[0]?.position ?? 'position is null'}</p>
            </div>
            <div className="card">
              <h3>Contact</h3>
              <div className="card-field">
                <span>Name</span>
                <p>
                  {user.firstName} {user.lastName ?? ''}
                </p>
              </div>
              <div className="card-field">
                <span>Mobile</span>
                <p>{user.phoneNumber ?? 'phone number is null'}</p>
              </div>
              <div className="card-field">
                <span>Email</span>
                <a className="link-email" href="mailto:name@email.com">
                  {user.email}
                </a>
              </div>
              <div className="card-field">
                <span>Company</span>
                <p>{user.profile?.[0]?.company ?? 'company is null'}</p>
              </div>
            </div>
            <div className="card">
              <h3>Location</h3>
              <p>{user.profile?.[0]?.location ?? 'location is null'}</p>
            </div>
            <div className="card">
              <h3>Web Links</h3>
              <a
                className="website-link"
                href={user.profile?.[0]?.website ?? ''}
              >
                Website
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
