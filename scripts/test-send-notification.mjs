const validActions = new Set([
  'Approved',
  'Rejected',
  'Obsoleted',
  'Compromised',
]);

function printUsage() {
  console.log(`Usage:
  npm run test:send-notification -- --email you@example.com [options]

Options:
  --email <value>       Recipient email address. Required unless TEST_NOTIFICATION_EMAIL is set.
  --first <value>       First name used in the payload. Default: Test User
  --action <value>      Approved | Rejected | Obsoleted | Compromised. Default: Approved
  --reason <value>      Optional reason, mainly useful with Rejected.
  --host <value>        Optional neuron host sent as x-agent-host.
  --secret <value>      Optional test secret for unauthenticated local testing.
  --url <value>         API URL. Default: http://localhost:3000/api/send-notification
  --help                Show this message

Environment variable fallbacks:
  TEST_NOTIFICATION_EMAIL
  TEST_NOTIFICATION_FIRST_NAME
  TEST_NOTIFICATION_ACTION
  TEST_NOTIFICATION_REASON
  TEST_NOTIFICATION_HOST
  TEST_NOTIFICATION_SECRET
  TEST_NOTIFICATION_URL

Examples:
  npm run test:send-notification -- --email you@example.com --secret your-test-secret --host dev.athletesandyou.tagroot.io
  npm run test:send-notification -- --email you@example.com --action Rejected --reason "Photo was unreadable" --secret your-test-secret --host br.id.tagroot.io
`);
}

function readOptionValue(arg, inlineValue, argv, index) {
  if (inlineValue !== undefined) {
    return { value: inlineValue, nextIndex: index };
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith('--')) {
    throw new Error(`Missing value for ${arg}`);
  }

  return { value: nextValue, nextIndex: index + 1 };
}

function parseArgs(argv) {
  const options = {
    url: process.env.TEST_NOTIFICATION_URL || 'http://localhost:3000/api/send-notification',
    action: process.env.TEST_NOTIFICATION_ACTION || 'Approved',
    email: process.env.TEST_NOTIFICATION_EMAIL || '',
    firstName: process.env.TEST_NOTIFICATION_FIRST_NAME || 'Test User',
    reason: process.env.TEST_NOTIFICATION_REASON || '',
    host: process.env.TEST_NOTIFICATION_HOST || '',
    secret: process.env.TEST_NOTIFICATION_SECRET || '',
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    const [name, inlineValue] = arg.split('=', 2);
    const { value, nextIndex } = readOptionValue(name, inlineValue, argv, index);
    index = nextIndex;

    switch (name) {
      case '--url':
        options.url = value;
        break;
      case '--action':
        options.action = value;
        break;
      case '--email':
        options.email = value;
        break;
      case '--first':
        options.firstName = value;
        break;
      case '--reason':
        options.reason = value;
        break;
      case '--host':
        options.host = value;
        break;
      case '--secret':
        options.secret = value;
        break;
      default:
        throw new Error(`Unknown argument: ${name}`);
    }
  }

  return options;
}

function buildPayload({ action, email, firstName, reason }) {
  return {
    action,
    user: {
      properties: {
        EMAIL: email,
        FIRST: firstName,
      },
    },
    reason,
  };
}

async function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error('Run with --help to see usage.');
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printUsage();
    return;
  }

  if (!options.email) {
    console.error('Missing email. Pass --email or set TEST_NOTIFICATION_EMAIL.');
    process.exitCode = 1;
    return;
  }

  if (!validActions.has(options.action)) {
    console.error(`Invalid action: ${options.action}`);
    console.error(`Use one of: ${Array.from(validActions).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const payload = buildPayload(options);

  console.log(`POST ${options.url}`);
  console.log(JSON.stringify(payload, null, 2));

  let response;
  try {
    response = await fetch(options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.host ? { 'x-agent-host': options.host } : {}),
        ...(options.secret ? { 'x-notification-test-secret': options.secret } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Request failed. Make sure the app is running and the URL is correct.');
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const rawBody = await response.text();
  let body = rawBody;

  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  if (!response.ok) {
    console.error(`Notification request failed with status ${response.status}.`);
    if (body) {
      console.error(typeof body === 'string' ? body : JSON.stringify(body, null, 2));
    }
    process.exitCode = 1;
    return;
  }

  console.log('Notification request succeeded.');
  if (body) {
    console.log(typeof body === 'string' ? body : JSON.stringify(body, null, 2));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
