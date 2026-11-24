/**
 * ResQ-AI Network & Dual-Layer Blackout Sentinel
 * Orchestrates native browser offline listeners and one-click judge blackout simulations.
 */

type NetworkStatusListener = (isOnline: boolean, isSimulated: boolean) => void;

class NetworkSentinel {
  private listeners: Set<NetworkStatusListener> = new Set();
  private simulatedBlackout: boolean = false;
  private physicalOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleBrowserNetworkChange(true));
      window.addEventListener('offline', () => this.handleBrowserNetworkChange(false));
    }
  }

  private handleBrowserNetworkChange(isOnline: boolean): void {
    this.physicalOnline = isOnline;
    this.notify();
  }

  /**
   * Returns effective connectivity state.
   * True ONLY if physical network is connected AND simulated blackout is OFF.
   */
  public isOperationalOnline(): boolean {
    return this.physicalOnline && !this.simulatedBlackout;
  }

  public isSimulated(): boolean {
    return this.simulatedBlackout;
  }

  /**
   * Toggles the tactical blackout simulation switch.
   */
  public setSimulatedBlackout(active: boolean): void {
    this.simulatedBlackout = active;
    this.notify();
  }

  public toggleSimulatedBlackout(): boolean {
    this.simulatedBlackout = !this.simulatedBlackout;
    this.notify();
    return this.simulatedBlackout;
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isOperationalOnline(), this.simulatedBlackout);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const effectiveOnline = this.isOperationalOnline();
    this.listeners.forEach((fn) => fn(effectiveOnline, this.simulatedBlackout));
  }
}

export const networkSentinel = new NetworkSentinel();
