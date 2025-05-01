import type { User } from "app-types/user";

/**
 * Returns a hard-coded user ID for temporary authentication purposes.
 *
 * @remarks
 * This function is a temporary solution until proper authentication is implemented.
 * It should be replaced with actual user authentication in future development.
 *
 */
export const getMockUserSession = (): User => {
  return {
    id: "pat",
    name: "pat",
    email: "pat@gmail.com",
    image: "https://github.com/patlove.png",
  };
};
