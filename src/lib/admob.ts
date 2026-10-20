import mobileAds from "react-native-google-mobile-ads";

// Inicializa el SDK de Google Mobile Ads. Se puede llamar sin haber
// configurado todavía un Ad Unit real (p. ej. en desarrollo, donde
// AppBannerAd usa los IDs de prueba de Google), así que no depende de
// env.admobAndroidBannerId para arrancar.
export function initAdMob() {
  mobileAds()
    .initialize()
    .catch((error) => {
      console.warn("Google Mobile Ads no pudo inicializarse", error);
    });
}
