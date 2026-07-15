import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@itreport/user';

export type AppUser = {
  id: string;
  name: string;
};

function createUser(): AppUser {
  const id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    name: `User ${id.slice(-4).toUpperCase()}`,
  };
}

export async function getAppUser(): Promise<AppUser> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (raw) {
    return JSON.parse(raw) as AppUser;
  }

  const user = createUser();
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
