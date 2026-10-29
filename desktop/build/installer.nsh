; Default install location: Desktop\采集\MT采集器, with a shortcut in Desktop\采集
!macro preInit
  SetRegView 64
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$DESKTOP\采集\MT采集器"
  SetRegView 32
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$DESKTOP\采集\MT采集器"
!macroend

!macro customInstall
  CreateDirectory "$DESKTOP\采集"
  Delete "$DESKTOP\采集\爆款图案采集器.lnk"
  CreateShortCut "$DESKTOP\采集\MT采集器.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
!macroend

!macro customUnInstall
  Delete "$DESKTOP\采集\MT采集器.lnk"
!macroend
