import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import { Header } from './components/Header';
import { Home } from './views/Home';
{{ if api.auth.enabled }}
import { Login, Logout } from './views/Login';
{{ end }}
{{~ for table in tables ~}}
{{~ if table.primary_key.is_none
      continue
    end
~}}
import { {{ table.name | string.capitalize }} } from './views/List{{ table.name }}';
{{~ end ~}}

function App() {
  {{ if api.auth.enabled }}
  const [pageLoaded, setPageLoaded] = React.useState(false);
  React.useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )au=([^;]+)'));
    const sessionToken = match ? match[2] : '';
    const isLogin = window.location.pathname === '/login';
    if (!sessionToken && !isLogin) {
      window.location.href = '/login?return=' + encodeURIComponent(window.location.href);
      return;
    } else if (sessionToken && isLogin) {
      window.location.href = '/';
      return;
    }

    setPageLoaded(true);
  }, []);

  if (!pageLoaded) {
    return null;
  }
  {{ end }}

  return (
    <Router>
      <div>
        <Header />

        <div className="container mx-auto">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            {{ if api.auth.enabled }}
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/logout">
              <Logout />
            </Route>
            {{ end }}
          
            {{~ for table in tables ~}}
            {{~ if table.primary_key.is_none
                  continue
                end
            ~}}
            <Route exact path="/{{ table.name }}">
              <{{ table.name | string.capitalize}} />
            </Route>
            {{~ end ~}}
          </Switch>
        </div>
      </div>
    </Router>
  );
}

window.onload = function () {
  ReactDOM.render(<App />, document.getElementById('root'));
}