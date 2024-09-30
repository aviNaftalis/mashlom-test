import React, { Suspense, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitals } from '../config/hospitals';
import AppsContainer from '../components/AppsContainer.tsx';
import { MashlomAppType } from '../config/apps.ts';
import Footer from '../components/Footer.tsx';
import IframeWrapper from '../components/IframeWrapper.tsx';
import Header from '../components/Header.tsx';

// Map of possible app components
const appComponents: Record<
  string,
  | React.LazyExoticComponent<React.ComponentType<any>>
  | { type: 'iframe'; urlPattern: string }
> = {
  demo: React.lazy(() => import('../apps/Demo/index.tsx')),
  eos: {
    type: 'iframe',
    urlPattern: 'https://mashlom.me/apps/pediatric/eos/?hospital=${hospital}',
  },
  // Add more apps here
};

const HospitalAppList: React.FC<{
  hospital: string;
  section: string;
  apps: MashlomAppType[];
}> = ({ hospital, apps, section }) => (
  <>
    <div>
      <h1>{section}</h1>
      <AppsContainer apps={apps} hospital={hospital} />
    </div>
  </>
);

const Hospital: React.FC = () => {
  const { hospital, app } = useParams<{
    hospital: string;
    app?: MashlomAppType;
  }>();
  const navigate = useNavigate();
  const hospitalConfig = hospitals[hospital || 'apps'];

  useEffect(() => {
    if (hospital && app && hospitalConfig) {
      const isAppValid = hospitalConfig.sections.some(section =>
        section.apps.includes(app));
      if (!isAppValid) {
        // If the app is not valid for this hospital, redirect to the hospital's index
        navigate(`/${hospital}`, { replace: true });
      }
    }
  }, [hospital, app, hospitalConfig, navigate]);

  if (!hospitalConfig) {
    return <div>Hospital not found</div>;
  }

  if (app) {
    const isAppValid = hospitalConfig.sections.some(section =>
      section.apps.includes(app));
    if (isAppValid) {
      const AppComponent = appComponents[app];

      if (!AppComponent) {
        return <div>App not found</div>;
      }

      if (typeof AppComponent === 'object' && AppComponent.type === 'iframe') {
        const iframeUrl = AppComponent.urlPattern.replace(
          '${hospital}',
          hospital || 'assuta'
        );
        return (
          <IframeWrapper url={iframeUrl} title={`${app} for ${hospital}`} />
        );
      } else {
        const LazyComponent = AppComponent as React.LazyExoticComponent<
          React.ComponentType<any>
        >;
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent hospital={hospital} />
          </Suspense>
        );
      }
      // return (
      //   <Suspense fallback={<div>Loading...</div>}>
      //     <AppComponent hospital={hospital} />
      //   </Suspense>
      // );
    }
  }

  // If no app is specified or app is invalid, show the hospital's app list
  return (
    <div>
      <Header credit="" hospitalName={hospital} />
      {hospitalConfig.sections.map((sectionItem, index) => (
        <HospitalAppList
          key={index}
          hospital={hospital || 'assuta'}
          apps={sectionItem.apps}  // Pass apps of the current section
          section={sectionItem.name}  // Pass the section name
        />
      ))}
      <Footer type="informative" />
    </div>
  );
};

export default Hospital;
