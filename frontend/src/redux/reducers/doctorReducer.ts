import { createReducer } from '@reduxjs/toolkit';
import { type DoctorState, type Doctor, type DoctorAvailability, type DoctorCredential } from '../types/doctorTypes';
import { 
  approveDoctorCredential, 
  clearDoctorError,
  getAvailability, 
  getDoctorCredentialById,
  getDoctorCredentials, 
  getDoctorProfile, 
  getPublicDoctorProfile, 
  listDoctors,
  rejectDoctorCredential, 
  resetDoctorState,
  submitDoctorCredential, 
  updateAvailability, 
  updateBasicDoctorProfile, 
  updateDoctorAddress,
  uploadProfilePicture 
} from '../actions/doctorActions';

const initialState: DoctorState = {
    profile: null,
    availability: [],
    credentials: [],
    doctorsList: [],
    publicProfile: null,
    loading: false,
    error: null,
    success: false,
    fetchLoading: false,
    fetchError: null,
    selectedDoctor: null
};

const doctorReducer = createReducer(initialState, (builder) => {
  builder
    // Profile Actions
    .addCase(getDoctorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(getDoctorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload as Doctor;
      state.success = true;
      state.error = null;
    })
    .addCase(getDoctorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(updateBasicDoctorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateBasicDoctorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload as Doctor;
      state.success = true;
      state.error = null;
    })
    .addCase(updateBasicDoctorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(updateDoctorAddress.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateDoctorAddress.fulfilled, (state, action) => {
      state.loading = false;
      if (state.profile && action.payload && typeof action.payload === 'object') {
        state.profile = { ...state.profile, ...(action.payload as Partial<Doctor>) };
      }
      state.success = true;
      state.error = null;
    })
    .addCase(updateDoctorAddress.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(uploadProfilePicture.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(uploadProfilePicture.fulfilled, (state, action) => {
      state.loading = false;
      if (state.profile && action.payload) {
        const profilePictureData = action.payload as { filename: string; path: string };
        state.profile.profilePicture = profilePictureData;
      }
      state.success = true;
      state.error = null;
    })
    .addCase(uploadProfilePicture.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Availability Actions
    .addCase(updateAvailability.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(updateAvailability.fulfilled, (state, action) => {
      state.loading = false;
      state.availability = action.payload as DoctorAvailability[];
      state.success = true;
      state.error = null;
    })
    .addCase(updateAvailability.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(getAvailability.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(getAvailability.fulfilled, (state, action) => {
      state.loading = false;
      state.availability = action.payload as DoctorAvailability[];
      state.success = true;
      state.error = null;
    })
    .addCase(getAvailability.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Credentials Actions
    .addCase(submitDoctorCredential.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(submitDoctorCredential.fulfilled, (state, action) => {
      state.loading = false;
      const newCredential = action.payload as DoctorCredential;
      state.credentials = [newCredential, ...state.credentials];
      state.success = true;
      state.error = null;
    })
    .addCase(submitDoctorCredential.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(getDoctorCredentials.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(getDoctorCredentials.fulfilled, (state, action) => {
      state.loading = false;
      state.credentials = action.payload as DoctorCredential[];
      state.success = true;
      state.error = null;
    })
    .addCase(getDoctorCredentials.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(getDoctorCredentialById.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(getDoctorCredentialById.fulfilled, (state, action) => {
      state.loading = false;
      const credential = action.payload as DoctorCredential;
      // Update specific credential if it exists in the array
      const credentialIndex = state.credentials.findIndex(
        cred => cred._id === credential._id
      );
      if (credentialIndex !== -1) {
        state.credentials[credentialIndex] = credential;
      }
      state.success = true;
      state.error = null;
    })
    .addCase(getDoctorCredentialById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(approveDoctorCredential.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(approveDoctorCredential.fulfilled, (state, action) => {
      state.loading = false;
      const updatedCredential = action.payload as DoctorCredential;
      state.credentials = state.credentials.map(cred => 
        cred._id === updatedCredential._id ? updatedCredential : cred
      );
      state.success = true;
      state.error = null;
    })
    .addCase(approveDoctorCredential.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(rejectDoctorCredential.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(rejectDoctorCredential.fulfilled, (state, action) => {
      state.loading = false;
      const updatedCredential = action.payload as DoctorCredential;
      state.credentials = state.credentials.map(cred => 
        cred._id === updatedCredential._id ? updatedCredential : cred
      );
      state.success = true;
      state.error = null;
    })
    .addCase(rejectDoctorCredential.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Public Actions
    .addCase(getPublicDoctorProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(getPublicDoctorProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.publicProfile = action.payload as Doctor;
      state.success = true;
      state.error = null;
    })
    .addCase(getPublicDoctorProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(listDoctors.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    })
    .addCase(listDoctors.fulfilled, (state, action) => {
      state.loading = false;
      const payload = action.payload as { doctors?: Doctor[] } | Doctor[];
      if (Array.isArray(payload)) {
        state.doctorsList = payload;
      } else if (payload && 'doctors' in payload && Array.isArray(payload.doctors)) {
        state.doctorsList = payload.doctors;
      } else {
        state.doctorsList = [];
      }
      state.success = true;
      state.error = null;
    })
    .addCase(listDoctors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    .addCase(resetDoctorState.fulfilled, () => initialState)

    .addCase(clearDoctorError.fulfilled, (state) => {
      state.error = null;
    });
});

export default doctorReducer;