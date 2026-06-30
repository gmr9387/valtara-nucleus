import { useContext } from "react";

import { authContext } from "@/lib/auth-context.shared";

export const useAuth = () => useContext(authContext);
