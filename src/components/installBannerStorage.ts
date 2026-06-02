export const INSTALL_BANNER_DISMISS_KEY = 'codequest:install-banner-dismissed'
export const INSTALL_BANNER_RESET_EVENT = 'codequest:install-banner-reset'

export function resetInstallBannerPreference() {
  localStorage.removeItem(INSTALL_BANNER_DISMISS_KEY)
  window.dispatchEvent(new Event(INSTALL_BANNER_RESET_EVENT))
}
