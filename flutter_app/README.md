# eSIM Global — Aplicación Móvil en Flutter (iOS, Android y Web)

Proyecto completo en Flutter para la plataforma de compra, gestión y recarga de eSIMs internacionales.

---

## 📱 Características Implementadas en Flutter

- **Catálogo Global y Filtro por Regiones**: Navegación por países (Estados Unidos, Japón, Europa, México, Emiratos Árabes, etc.) con búsqueda en tiempo real.
- **Selector de Planes y Días**: Selección entre planes estándar de Gigabytes fijos o planes **Ilimitados por Días**.
- **Gestión de eSIMs y Códigos QR**: Renderizado nativo del código QR con `qr_flutter`, dirección SM-DP+ y código de activación con botón de copiado directo.
- **Medidor de Consumo y Recargas Instantáneas**: Gráfica de porcentaje de datos restantes y modal de Top-Up de Gigabytes en 1 clic.
- **Soporte de Modo Claro / Oscuro Nativo**: Integración con Material 3 y `google_fonts` (Plus Jakarta Sans).
- **Gestión de Estado Reactiva**: Basada en `flutter_riverpod`.

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Requisitos Previos
- Tener instalado el [Flutter SDK](https://flutter.dev/docs/get-started/install) (versión 3.0.0 o superior).
- Un emulador (Android Emulator / iOS Simulator) o dispositivo físico conectado.

### 2. Instalación de Dependencias
Abre la terminal en la carpeta `flutter_app` y ejecuta:

```bash
cd flutter_app
flutter pub get
```

### 3. Ejecutar la Aplicación

- **En Emulador o Teléfono Conectado**:
```bash
flutter run
```

- **En Google Chrome (Flutter Web)**:
```bash
flutter run -d chrome
```

- **Para compilar APK para Android**:
```bash
flutter build apk --release
```

- **Para compilar para iOS (desde macOS con Xcode)**:
```bash
flutter build ipa
```

---

## 📂 Estructura del Código

```text
flutter_app/
├── pubspec.yaml                # Dependencias (Riverpod, QR, Lucide Icons, etc.)
└── lib/
    ├── main.dart               # Punto de entrada de la aplicación Flutter
    ├── theme/
    │   └── app_theme.dart      # Temas claro y oscuro Material 3
    ├── models/
    │   ├── destination.dart    # Modelos de destinos y planes
    │   └── user_esim.dart      # Modelo de eSIM activa y consumo
    ├── data/
    │   └── sample_data.dart    # Catálogo de países y perfiles iniciales
    ├── providers/
    │   └── esim_provider.dart  # Estado global con Riverpod
    ├── screens/
    │   ├── home_shell_screen.dart       # Barra de navegación inferior
    │   ├── catalog_screen.dart          # Explorador de países y búsqueda
    │   ├── my_esims_screen.dart         # eSIMs activas del usuario
    │   ├── plan_detail_bottom_sheet.dart# Selector de paquetes de datos
    │   ├── qr_viewer_dialog.dart        # Código QR e instalación manual
    │   └── top_up_dialog.dart           # Recarga de Gigabytes
    └── widgets/
        ├── destination_card.dart        # Tarjeta de destino
        └── esim_card.dart               # Tarjeta con medidor de consumo
```
