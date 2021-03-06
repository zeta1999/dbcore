import React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { Form } from '../components/Form';
import { Heading } from '../components/Heading';
import { Input } from '../components/Input';
import { Link } from '../components/Link';
import { List } from '../components/List';
import { request } from '../api';

{{~
  func javascriptValueify
    case $0
      when "integer", "bigint", "smallint", "decimal", "numeric", "real", "double precision"
        "Number"
      when "boolean"
        "Boolean"
      else
        ""
    end
  end
~}}

export function {{ table.name|string.capitalize }}Update() {
  const [state, setState] = React.useState({
    {{~ for column in table.columns ~}}
    {{~ if column.auto_increment
          continue
        end ~}}
    '{{ column.name }}': '',
    {{~ end ~}}
  });

  const history = useHistory();
  const [error, setError] = React.useState('');
  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();
    setError('');

    try {
      const rsp = await request(`{{ table.name }}/${key}`, {
        {{~ for column in table.columns ~}}
        {{~ if column.auto_increment
              continue
            end ~}}
        '{{ column.name }}': {{ javascriptValueify column.type }}(state['{{ column.name }}']),
        {{~ end ~}}
      }, 'PUT');

      if (rsp.error) {
        setError(rsp.error);
        return;
      }

      history.push(`/{{ table.name }}/_/${key}`);
    } catch (e) {
      // Need the try-catch so we can return false here.
      console.error(e);
      return false;
    }
  });

  const { params: { key } } = useRouteMatch();
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(function() {
    async function fetchRow() {
      setError(error);
      const rsp = await request(`{{ table.name }}/${key}`);

      if (rsp.error) {
        setError(rsp.error);
        return;
      }

      setState(rsp);
      setLoaded(true);
    }

    fetchRow();
  }, [key]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <Link to="/{{ table.name }}">{{ table.name|string.capitalize }}</Link> / {key}
      <Heading size="xl">Update</Heading>
      <Form error={error} buttonText="Update" onSubmit={handleSubmit}>
        {{~ for column in table.columns ~}}
        {{~ if column.auto_increment
              continue
            end ~}}
        <div className="mb-4">
          <Input
            label="{{ column.name }}"
            id="{{ column.name }}"
            value={state['{{ column.name }}']}
            onChange={(e) => {
              // e.target.value is not available within the setState callback, so copy it.
              // https://duncanleung.com/fixing-react-warning-synthetic-events-in-setstate/
              const { value } = e.target;
              setState(s => ({ ...s, ['{{ column.name }}']: value }))
            }}
          />
        </div>
        {{ end }}
      </Form>
    </>
  );
}
