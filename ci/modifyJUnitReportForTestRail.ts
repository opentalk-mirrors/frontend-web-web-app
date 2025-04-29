// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import * as fs from 'fs';

const inputFile = process.env.PLAYWRIGHT_JUNIT_INPUT_FILE;
const outputFile = process.env.PLAYWRIGHT_JUNIT_OUTPUT_FILE;
const suiteNameSlug = process.env.BROWSER;

interface TestSuite {
  name: string;
  tests?: number;
  failures?: number;
  errors?: number;
  skipped?: number;
}

interface TestSuites {
  testsuites: {
    testsuite: TestSuite | TestSuite[];
  };
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

function renameTestSuite() {
  try {
    const xmlContent = fs.readFileSync(inputFile, 'utf-8');
    const parsedXML: TestSuites = parser.parse(xmlContent);

    if (parsedXML.testsuites?.testsuite) {
      const testSuite = parsedXML.testsuites.testsuite;

      if (Array.isArray(testSuite)) {
        for (const suite of testSuite) {
          suite.name = `${suiteNameSlug} - ${suite.name}`;
        }
      } else {
        testSuite.name = `${suiteNameSlug} - ${testSuite.name}`;
      }

      const updatedXml = builder.build(parsedXML);
      fs.writeFileSync(outputFile, updatedXml);
      console.log(`✅ JUnit-Report created: ${outputFile}`);
    } else {
      console.warn('⚠️ Cant find any testsuite');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

renameTestSuite();
