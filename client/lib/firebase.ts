export function signInWithGoogle() { return Promise.resolve(null); }
export const auth = { onAuthStateChanged: (_: any) => () => {}, signOut: () => Promise.resolve() };