import axios, { AxiosError } from 'axios';
import { BACKEND_URL } from '../../utils/constants';

export const createUser = async (userName: string, email: string, achievements: any) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/user`,
      { userName, email, achievements },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    console.log('Create user response:', response);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Error creating user:', axiosError.message);
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error(
          'Network Error: Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else if (axiosError.response?.status === 403) {
        throw new Error('Access denied. Please check your permissions and try again.');
      } else {
        throw new Error(`Error creating user: ${axiosError.message}`);
      }
    } else {
      console.error('Error creating user:', error);
      throw new Error('An unexpected error occurred while creating the user.');
    }
  }
};

export const updateUser = async (achievements: any, email: string, name: string) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/user/update`,
      { achievements, email, name },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    );
    console.log('Update achievements response:', response);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Error updating achievements:', axiosError.message);
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error(
          'Network Error: Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else if (axiosError.response?.status === 403) {
        throw new Error('Access denied. Please check your permissions and try again.');
      } else {
        throw new Error(`Error updating achievements: ${axiosError.message}`);
      }
    } else {
      console.error('Error updating achievements:', error);
      throw new Error('An unexpected error occurred while updating achievements.');
    }
  }
};

export const getUser = async (email: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/user/${email}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    console.log('Get user response:', response);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Error getting user:', axiosError.message);
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error(
          'Network Error: Unable to connect to the server. Please check your internet connection and try again.'
        );
      } else if (axiosError.response?.status === 403) {
        throw new Error('Access denied. Please check your permissions and try again.');
      } else {
        throw new Error(`Error getting user: ${axiosError.message}`);
      }
    } else {
      console.error('Error getting user:', error);
      throw new Error('An unexpected error occurred while getting the user.');
    }
  }
};
