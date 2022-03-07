import { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

// from https://stackoverflow.com/questions/36904185/react-router-scroll-to-top-on-every-transition+&cd=1&hl=en&ct=clnk&gl=us

function ScrollToTop({history}) {
    useEffect(() => {
        const unlisten = history.listen(() => {
            window.scrollTo(0, 0);
        });
        return () => {
            unlisten();
        }
    }, []);

    return (null);
}

export default withRouter(ScrollToTop);
