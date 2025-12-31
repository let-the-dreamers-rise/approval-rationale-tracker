/**
 * App Root Component
 * Wraps the application with context providers
 */
import { LoanCockpitProvider } from './context/LoanCockpitContext';
import { LoanCockpit } from './components/LoanCockpit';

function App() {
  return (
    <LoanCockpitProvider>
      <LoanCockpit />
    </LoanCockpitProvider>
  );
}

export default App;
