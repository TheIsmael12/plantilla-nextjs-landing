import views from "./views.json";
import common from "./common.json";
import navigation from "./navigation.json";
import buttons from "./buttons.json";
import validation from "./validation.json";
import cookies from "./cookies.json";
import legal from "./legal.json";
import metadata from "./metadata.json";
import table from "./table.json";
import tabs from "./tabs.json";
import modals from "./modals.json";
import labels from "./labels.json";
import placeholders from "./placeholders.json";

const messages = {
  ...common,
  ...views,
  ...buttons,
  ...navigation,
  ...validation,
  ...cookies,
  ...legal,
  ...metadata,
  ...table,
  ...tabs,
  ...modals,
  ...labels,
  ...placeholders,
};

export default messages;
