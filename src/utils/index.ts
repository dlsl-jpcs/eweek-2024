
export class Position {
  constructor(public x: number, public y: number) { }
}

export class Size {
  constructor(public width: number, public height: number) { }
}

export function cartesianToIsometric(pos: Position) {
  var tempPt = new Position(0, 0);
  tempPt.x = pos.x - pos.y;
  tempPt.y = (pos.x + pos.y) / 2;
  return tempPt;
}

export function randomIntRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function clamp(input: number, min: number, max: number) {
  return Math.min(Math.max(input, min), max);
};


interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
const iOS = typeof requestPermission === 'function';

export async function getOrientationPermissionState(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!iOS) {
    return 'granted';
  }

  // check local storage
  const permission = localStorage.getItem('orientationPermission');
  if (permission === 'denied') {
    return 'denied';
  }

  if (permission === 'granted') {
    return 'granted';
  }

  return 'prompt';
}

export async function requestOrientationPermissions(): Promise<'granted' | 'denied'> {
  // short-circuit if not iOS
  if (!iOS) {
    return 'granted';
  }

  // first try to get from saved local storage
  const permission = localStorage.getItem('orientationPermission');
  if (permission === 'denied') {
    return 'denied';
  }

  // if not, request permission
  const response = await requestPermission();

  // save to local storage
  localStorage.setItem('orientationPermission', response);

  return response;
}


export function isDebugModeOn(): boolean {
  const debugSetting = new URLSearchParams(window.location.search).get('debug');
  if (debugSetting) {
    if (debugSetting === 'true') {
      return true;
    }
    else {
      return false;
    }
  }

  // check if is running locally
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export function getServerURL() {
  return isDebugModeOn() ? 'http://localhost:3000' : 'https://eweek-api.tyronscott.me';
}

export function isIos() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}