import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'authToken';
const ROLE_KEY = 'authRole';

const isWeb = Platform.OS === 'web';

const webSetItem = (key: string, value: string) => {
	try {
		globalThis.localStorage?.setItem(key, value);
	} catch {
		// Ignore storage errors on web.
	}
};

const webGetItem = (key: string) => {
	try {
		return globalThis.localStorage?.getItem(key) ?? null;
	} catch {
		return null;
	}
};

const webDeleteItem = (key: string) => {
	try {
		globalThis.localStorage?.removeItem(key);
	} catch {
		// Ignore storage errors on web.
	}
};

export const saveToken = async (token: string) => {
	if (isWeb) {
		webSetItem(TOKEN_KEY, token);
		return;
	}
	await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
	if (isWeb) {
		return webGetItem(TOKEN_KEY);
	}
	return SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteToken = async () => {
	if (isWeb) {
		webDeleteItem(TOKEN_KEY);
		webDeleteItem(ROLE_KEY);
		return;
	}
	await SecureStore.deleteItemAsync(TOKEN_KEY);
	await SecureStore.deleteItemAsync(ROLE_KEY);
};

export const saveRole = async (role: string) => {
	if (isWeb) {
		webSetItem(ROLE_KEY, role);
		return;
	}
	await SecureStore.setItemAsync(ROLE_KEY, role);
};

export const getRole = async () => {
	if (isWeb) {
		return webGetItem(ROLE_KEY);
	}
	return SecureStore.getItemAsync(ROLE_KEY);
};
