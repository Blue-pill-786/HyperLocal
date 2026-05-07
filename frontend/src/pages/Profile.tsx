import { useAuthStore } from '@stores/authStore';

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Please log in to view your profile</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600">First Name</p>
            <p className="text-xl font-semibold">{user.firstName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Name</p>
            <p className="text-xl font-semibold">{user.lastName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="text-xl font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone</p>
            <p className="text-xl font-semibold">{user.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Edit Profile
        </button>
        <button
          onClick={logout}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
