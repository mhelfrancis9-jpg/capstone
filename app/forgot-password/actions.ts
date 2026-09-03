// Customer password-reset request action. The single source of truth lives in
// the login route actions (matching the admin pattern), and is re-exported
// here for the dedicated /forgot-password page.
export {
  customerForgotPassword,
  type ForgotState,
} from "../login/actions";

