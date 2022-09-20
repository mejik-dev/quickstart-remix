import * as React from 'react';
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import { json, redirect } from '@remix-run/node';
import { microgenApiUrl } from '~/lib/microgen.server';
import { getToken, microgenToken } from '~/utils/cookie';

export const action = async ({ request }) => {
  const formData = await request.formData();
  const profileID = formData.get('profileid');
  const token = await getToken(request);
  const operation = formData.get('operation');
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (operation === 'upload image') {
    const responseUpload = await fetch(`${microgenApiUrl}/storage/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const image = await responseUpload.json();

    const response = await fetch(`${microgenApiUrl}/profile/${profileID}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        image: image?.url,
      }),
    });

    if (responseUpload.status !== 200 || response.status !== 200) {
      return json({
        message: 'Failed to upload image',
      });
    } else {
      return json({
        message: 'profile updated!',
      });
    }
  }

  if (operation === 'update profile') {
    const firstName = formData.get('firstname');
    const lastName = formData.get('lastname');
    const phoneNumber = formData.get('phonenumber');
    const company = formData.get('company');
    const position = formData.get('position');
    const location = formData.get('location');
    const website = formData.get('website');

    const userResponse = await fetch(`${microgenApiUrl}/auth/user`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        firstName,
        lastName,
        phoneNumber,
      }),
    });

    const profileData = {
      company,
      position,
      location,
    };

    if (website !== '') {
      profileData.website = website;
    }

    const profileResponse = await fetch(
      `${microgenApiUrl}/profile/${profileID}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(profileData),
      }
    );

    if (profileResponse.status !== 200 || userResponse.status !== 200) {
      return json({
        message: 'Failed to update profile',
      });
    } else {
      return json({
        operation,
        message: 'profile updated!',
      });
    }
  }

  if (operation === 'logout') {
    return redirect('/', {
      headers: {
        'Set-Cookie': await microgenToken.serialize('', {
          maxAge: 0,
        }),
      },
    });
  }
};

export const loader = async ({ request }) => {
  const token = await getToken(request);

  if (!token) {
    return redirect('/');
  }

  const response = await fetch(`${microgenApiUrl}/auth/user?$lookup=*`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const user = await response.json();

  return json({
    user,
  });
};

const EditProfile = () => {
  const transition = useTransition();
  const submit = useSubmit();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const operation = transition.submission?.formData.get('operation');
  const [user, setUser] = React.useState('');
  const [profile, setProfile] = React.useState('');

  React.useEffect(() => {
    if (loaderData?.user) {
      setUser(loaderData.user);
      setProfile(loaderData.user?.profile?.[0]);
    }
  }, [loaderData]);

  React.useEffect(() => {
    if (actionData?.message && actionData?.operation === 'update profile') {
      alert(actionData.message);
    }
  }, [actionData]);

  const handleChangeImage = (event) => {
    submit(event.currentTarget, { replace: true });
  };

  return (
    <div className="profile-page">
      <div className="button-top">
        <Link className="button" to={`/${user?.username}`}>
          View Profile
        </Link>
        <Form method="post">
          <input type="hidden" name="operation" value="logout" />
          <button>Logout</button>
        </Form>
      </div>
      <div className="profile-wrapper">
        <div className="profile-header">
          <Form
            encType="multipart/form-data"
            method="post"
            onChange={handleChangeImage}
          >
            <input type="hidden" name="operation" value="upload image" />
            <input type="hidden" name="profileid" value={profile?._id} />
            <label className="label-file" htmlFor="file">
              <img
                className="image-avatar"
                width={90}
                height={90}
                src={
                  profile?.image
                    ? profile.image
                    : 'https://via.placeholder.com/90'
                }
                alt=""
              />
              <span>
                {operation === 'upload image' &&
                transition.state === 'submitting'
                  ? 'Uploading...'
                  : 'Change Image'}
              </span>
            </label>
            <input name="file" id="file" type="file" accept="image/*" />
          </Form>
        </div>
        <div className="card">
          <Form method="post">
            <input type="hidden" name="profileid" value={profile?._id} />
            <input type="hidden" name="operation" value="update profile" />
            <div className="card-field">
              <label>First Name</label>
              <input
                type="text"
                name="firstname"
                defaultValue={user?.firstName}
              />
            </div>
            <div className="card-field">
              <label>Last Name</label>
              <input
                type="text"
                name="lastname"
                defaultValue={user?.lastName}
              />
            </div>
            <div className="card-field">
              <label>Phone Number</label>
              <input
                type="text"
                name="phonenumber"
                defaultValue={user?.phoneNumber}
              />
            </div>
            <div className="card-field">
              <label>Company</label>
              <input
                type="text"
                name="company"
                defaultValue={profile?.company}
              />
            </div>
            <div className="card-field">
              <label>Position</label>
              <input
                type="text"
                name="position"
                defaultValue={profile?.position}
              />
            </div>
            <div className="card-field">
              <label>Location</label>
              <input
                type="text"
                name="location"
                defaultValue={profile?.location}
              />
            </div>
            <div className="card-field">
              <label>Website</label>
              <input
                type="url"
                name="website"
                defaultValue={profile?.website}
              />
            </div>
            <div className="form-button">
              <button type="submit" className="button button-primary">
                Update
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
