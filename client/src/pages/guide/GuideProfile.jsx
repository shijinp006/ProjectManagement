// import React, { useState, useEffect } from 'react'
// import { FaUser, FaEnvelope, FaIdCard, FaBuilding, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSave, FaCamera } from 'react-icons/fa'
// import { useAdmin } from '../../contexts/AdminContext'

// const GuideProfile = () => {
//   const { updateProfile, getProfile } = useAdmin()
//   const [currentUser, setCurrentUser] = useState(null)
//   const [profileData, setProfileData] = useState({
//     dob: '',
//     phone: '',
//     place: '',
//     address: '',
//     teacherId: '',
//     profileImage: ''
//   })
//   const [imagePreview, setImagePreview] = useState(null)
//   const [saving, setSaving] = useState(false)
//   const [message, setMessage] = useState({ type: '', text: '' })

//   // Load current user and profile data
//   useEffect(() => {
//     const userData = localStorage.getItem('user')
//     if (!userData) return

//     try {
//       const user = JSON.parse(userData)
//       if (user.role !== 'guide') return

//       setCurrentUser(user)

//       // Load existing profile data
//       const existingProfile = getProfile(user.id)
//       if (existingProfile) {
//         setProfileData({
//           dob: existingProfile.dob || '',
//           phone: existingProfile.phone || '',
//           place: existingProfile.place || '',
//           address: existingProfile.address || '',
//           teacherId: existingProfile.teacherId || '',
//           profileImage: existingProfile.profileImage || ''
//         })
//         if (existingProfile.profileImage) {
//           setImagePreview(existingProfile.profileImage)
//         }
//       }
//     } catch (err) {
//       console.error('User parse error:', err)
//     }
//   }, [getProfile])

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setProfileData(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0]
//     if (!file) return

//     // Validate file type
//     if (!file.type.startsWith('image/')) {
//       setMessage({ type: 'error', text: 'Please upload a valid image file (JPG, PNG, etc.)' })
//       return
//     }

//     // Validate file size (max 2MB)
//     if (file.size > 2 * 1024 * 1024) {
//       setMessage({ type: 'error', text: 'Image size should be less than 2MB' })
//       return
//     }

//     // Convert to base64
//     const reader = new FileReader()
//     reader.onloadend = () => {
//       const base64String = reader.result
//       setProfileData(prev => ({
//         ...prev,
//         profileImage: base64String
//       }))
//       setImagePreview(base64String)
//     }
//     reader.readAsDataURL(file)
//   }

//   const handleSaveProfile = () => {
//     // Validate phone number
//     if (profileData.phone && !/^\d{10}$/.test(profileData.phone.replace(/\s/g, ''))) {
//       setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' })
//       return
//     }

//     setSaving(true)
//     setMessage({ type: '', text: '' })

//     try {
//       updateProfile(currentUser.id, profileData)
//       setMessage({ type: 'success', text: 'Profile updated successfully!' })

//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setMessage({ type: '', text: '' })
//       }, 3000)
//     } catch (err) {
//       setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (!currentUser) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="text-slate-500">Loading...</div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen  p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
//             <FaUser className="text-blue-400" />
//             Guide Profile
//           </h1>
//           <p className="text-slate-300">Manage your profile information</p>
//         </div>

//         {/* Profile Image Section */}
//         <div className="backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-6 shadow-2xl">
//           <div className="flex flex-col items-center">
//             <div className="relative mb-4">
//               <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white/30">
//                 {imagePreview ? (
//                   <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
//                 ) : (
//                   <FaUser className="text-6xl text-white" />
//                 )}
//               </div>
//               <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full cursor-pointer transition-colors shadow-lg">
//                 <FaCamera />
//                 <input
//                   type="file"
//                   id="profileImage"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//               </label>
//             </div>
//             <p className="text-sm text-slate-300">Click the camera icon to upload a profile picture</p>
//             <p className="text-xs text-slate-400 mt-1">Max size: 2MB (JPG, PNG)</p>
//           </div>
//         </div>

//         {/* Existing User Info (Non-editable) */}
//         <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-6 shadow-2xl">
//           <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
//             <FaIdCard className="text-blue-400" />
//             Account Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
//               <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white">
//                 {currentUser.name}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
//               <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white">
//                 {currentUser.username}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
//               <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white flex items-center gap-2">
//                 <FaEnvelope className="text-blue-400" />
//                 {currentUser.email}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
//               <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white flex items-center gap-2">
//                 <FaBuilding className="text-blue-400" />
//                 {currentUser.department}
//               </div>
//             </div>
//             {currentUser.specialization && (
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Specialization</label>
//                 <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-white">
//                   {currentUser.specialization}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Editable Profile Information */}
//         <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-6 shadow-2xl">
//           <h2 className="text-2xl font-semibold text-white mb-6">Additional Information</h2>

//           <div className="space-y-6">
//             {/* Date of Birth */}
//             <div>
//               <label htmlFor="dob" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
//                 <FaCalendarAlt className="text-blue-400" />
//                 Date of Birth
//               </label>
//               <input
//                 type="date"
//                 id="dob"
//                 name="dob"
//                 value={profileData.dob}
//                 onChange={handleInputChange}
//                 className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               />
//             </div>

//             {/* Phone Number */}
//             <div>
//               <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
//                 <FaPhone className="text-blue-400" />
//                 Phone Number
//               </label>
//               <input
//                 type="tel"
//                 id="phone"
//                 name="phone"
//                 value={profileData.phone}
//                 onChange={handleInputChange}
//                 placeholder="Enter 10-digit phone number"
//                 className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               />
//             </div>

//             {/* Place */}
//             <div>
//               <label htmlFor="place" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
//                 <FaMapMarkerAlt className="text-blue-400" />
//                 Place
//               </label>
//               <input
//                 type="text"
//                 id="place"
//                 name="place"
//                 value={profileData.place}
//                 onChange={handleInputChange}
//                 placeholder="Enter your city/town"
//                 className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               />
//             </div>

//             {/* Teacher ID */}
//             <div>
//               <label htmlFor="teacherId" className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
//                 <FaIdCard className="text-blue-400" />
//                 Teacher ID
//               </label>
//               <input
//                 type="text"
//                 id="teacherId"
//                 name="teacherId"
//                 value={profileData.teacherId}
//                 onChange={handleInputChange}
//                 placeholder="Enter your teacher ID"
//                 className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               />
//             </div>

//             {/* Address */}
//             <div>
//               <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-2">
//                 Address
//               </label>
//               <textarea
//                 id="address"
//                 name="address"
//                 value={profileData.address}
//                 onChange={handleInputChange}
//                 placeholder="Enter your complete address"
//                 rows="4"
//                 className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Message Display */}
//         {message.text && (
//           <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
//               ? 'bg-green-500/20 border-green-500/50 text-green-200'
//               : 'bg-red-500/20 border-red-500/50 text-red-200'
//             }`}>
//             {message.text}
//           </div>
//         )}

//         {/* Save Button */}
//         <div className="flex justify-end">
//           <button
//             onClick={handleSaveProfile}
//             disabled={saving}
//             className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <FaSave />
//             {saving ? 'Saving...' : 'Save Profile'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default GuideProfile


import React, { useState, useEffect } from 'react'
import { FaUser, FaEnvelope, FaIdCard, FaBuilding, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSave, FaCamera } from 'react-icons/fa'
import { useAdmin } from '../../contexts/AdminContext'

const GuideProfile = () => {
  const { updateProfile, getProfile } = useAdmin()
  const [currentUser, setCurrentUser] = useState(null)
  const [profileData, setProfileData] = useState({
    dob: '',
    phone: '',
    place: '',
    address: '',
    teacherId: '',
    profileImage: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Load current user and profile data
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) return

    try {
      const user = JSON.parse(userData)
      if (user.role !== 'guide') return

      setCurrentUser(user)

      // Load existing profile data
      const existingProfile = getProfile(user.id)
      if (existingProfile) {
        setProfileData({
          dob: existingProfile.dob || '',
          phone: existingProfile.phone || '',
          place: existingProfile.place || '',
          address: existingProfile.address || '',
          teacherId: existingProfile.teacherId || '',
          profileImage: existingProfile.profileImage || ''
        })
        if (existingProfile.profileImage) {
          setImagePreview(existingProfile.profileImage)
        }
      }
    } catch (err) {
      console.error('User parse error:', err)
    }
  }, [getProfile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload a valid image file (JPG, PNG, etc.)' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 2MB' })
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      setProfileData(prev => ({
        ...prev,
        profileImage: base64String
      }))
      setImagePreview(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = () => {
    // Validate phone number
    if (profileData.phone && !/^\d{10}$/.test(profileData.phone.replace(/\s/g, ''))) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      updateProfile(currentUser.id, profileData)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-slate-100">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-700 flex items-center gap-3 mb-2">
            <FaUser className="text-blue-500" />
            Guide Profile
          </h1>
          <p className="text-slate-600">Manage your profile information</p>
        </div>

        {/* Profile Image Section */}
        <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-6xl text-white" />
                )}
              </div>
              <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full cursor-pointer transition-colors shadow">
                <FaCamera />
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-slate-600">Click the camera icon to upload a profile picture</p>
            <p className="text-xs text-slate-500 mt-1">Max size: 2MB (JPG, PNG)</p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-600 mb-6 flex items-center gap-2">
            <FaIdCard className="text-blue-500" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
              <div className="bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800">
                {currentUser.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Username</label>
              <div className="bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800">
                {currentUser.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
              <div className="bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                {currentUser.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Department</label>
              <div className="bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 flex items-center gap-2">
                <FaBuilding className="text-blue-500" />
                {currentUser.department}
              </div>
            </div>
            {currentUser.specialization && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-2">Specialization</label>
                <div className="bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800">
                  {currentUser.specialization}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editable Profile */}
        <div className="bg-white border border-gray-300 rounded-2xl p-8 mb-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-slate-600 mb-6">Additional Information</h2>

          <div className="space-y-6">

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={profileData.dob}
                onChange={handleInputChange}
                className="w-full bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <FaPhone className="text-blue-500" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter 10-digit phone number"
                className="w-full bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="place" className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" />
                Place
              </label>
              <input
                type="text"
                id="place"
                name="place"
                value={profileData.place}
                onChange={handleInputChange}
                placeholder="Enter your city/town"
                className="w-full bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
                <FaIdCard className="text-blue-500" />
                Teacher ID
              </label>
              <input
                type="text"
                id="teacherId"
                name="teacherId"
                value={profileData.teacherId}
                onChange={handleInputChange}
                placeholder="Enter your teacher ID"
                className="w-full bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={profileData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                rows="4"
                className="w-full bg-slate-100 border border-gray-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-100 border-green-300 text-green-700'
              : 'bg-red-100 border-red-300 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuideProfile
