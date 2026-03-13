# Content from https://emea.ttinteractive.com/Zenith/TTI.PublicApi.Services/JsonSaleEngineService.svc/Help

# Http Sale Engine Service

#### Json Schema

Json Service can provide json schema equivalent to the wsdl of the Soap service :

- Schema: [JsonSaleEngineService.svc?jsonSchema](https://emea.ttinteractive.com/Zenith/TTI.PublicApi.Services/JsonSaleEngineService.svc/JsonSaleEngineService.svc?jsonSchema)

#### Swagger

Swagger for this service can be found [here](https://emea.ttinteractive.com/Zenith/TTI.PublicApi.Services/swagger/ui/index?service=SaleEngineService).

#### Accepted content types

Depending request content-type the following formatters are available :

- **Json** (TTI.PublicApi.Services.PublicApiJsonMediaTypeFormatter)
  - application/json
  - text/json
- **Xml** (System.Net.Http.Formatting.XmlMediaTypeFormatter)
  - application/xml
  - text/xml

#### Http methods

POST and PUT are accepted. Request body is expected to contain the request message.

#### Request BodyStyle

Two modes are available. Use query string or http request headers to set the mode to apply :

- **Wrapped \[default\]**: request must be wrapped into root object.

  Json example : { "request": { ...your request object here... } }
- **Bare (?BodyStyle=Bare) \[Recommended\]**: request is directly in bare format .

  Json example : { ...your request object here... }

#### DateTime Format (Json only)

Two date time formats are available. Use query string or http request headers to set the date format to apply :

- **MicrosoftDateFormat \[default\]**: Dates format is Microsoft. "/Date(\[MillisecondsSince01Jan1970Utc\])/".
- **IsoDateFormat (?DateFormatHandling=IsoDateFormat) \[Recommended\]**: Dates format is Iso. "yyyy-MM-ddTHH:mm:ssZ"

For request messages, both formats are accepted.

#### TimeZone Handling (Json only)

It is possible to omit server time zone handling with the following parameter ( **however you still have to take care to your client time zone**). This works with ISO or microsoft date format :

- **Include server time zone \[default\]**: Server time zone is specified (or 'Z' for UTC) "2021-05-10T19:52:33+08:00", "2021-05-10T19:52:33Z"
- **Ignore server time zone (?TimeZoneHandling=Ignore) \[Recommended\]**: Dates are transmitted without timezone. "2021-05-10T19:52:33"

For request messages, time zone will be parsed if present even server time zone is ignored, so you should take care to omit it.

#### Indented response (Json only)

If you want to get Json response with indentation, just add " **Indent=1**" to the query string or http headers.

#### Examples

- JsonSaleEngineService.svc/Ping: Wrapped request, Microsoft date time format (defaults)
- JsonSaleEngineService.svc/Ping?BodyStyle=Bare: Bare format
- JsonSaleEngineService.svc/Ping?DateFormatHandling=IsoDateFormat: ISO date time format
- JsonSaleEngineService.svc/Ping?TimeZoneHandling=Ignore: Ignore server timezone
- JsonSaleEngineService.svc/Ping?Indent=1: Indented response
- JsonSaleEngineService.svc/Ping?BodyStyle=Bare&DateFormatHandling=IsoDateFormat&TimeZoneHandling=Ignore&Indent=1: All together