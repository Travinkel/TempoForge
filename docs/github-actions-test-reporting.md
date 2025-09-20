# Improving GitHub Actions Test Reporting

## Why default test output looks sparse
GitHub Actions runs commands such as `dotnet test` and relies solely on their exit codes. By default it does not parse the structured test output, so failed runs surface as a generic job failure without per-test results.

## Recommended improvements
1. **Emit structured results** – Configure `dotnet test` to produce JUnit or TRX files:
   ```bash
   dotnet test --logger "junit;LogFileName=test-results.xml" --results-directory ./test-results
   ```
2. **Upload the artifacts** – Persist the generated XML using `actions/upload-artifact@v4` so GitHub can read them later.
3. **Publish the report** – Use an action such as `dorny/test-reporter@v1` (or GitHub's native test reporting) to render green/red status for each test case in the Actions UI.

### Sample workflow snippet
```yaml
- name: Run tests with JUnit logger
  run: dotnet test --logger "junit;LogFileName=test-results.xml" --results-directory ./test-results

- name: Upload test results
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: ./test-results

- name: Publish test report
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Backend Tests
    path: ./test-results/test-results.xml
    reporter: java-junit
```

## Alternatives and complementary tools
- **CI platforms with richer default dashboards** – Azure DevOps, GitLab, and CircleCI include built-in test visualizations.
- **Third-party dashboards** – Allure, ReportPortal, or Datadog CI dashboards can ingest the same XML for more detailed analytics.
- **Local developer tooling** – `dotnet watch test` and IDE test explorers provide instant, colored feedback during development.

## Action plan for TempoForge
- Add `--logger junit` to the existing `dotnet test` steps.
- Store the XML in `./test-results`.
- Publish the results with `dorny/test-reporter@v1` (or GitHub's native test reporting).
- Optionally explore alternative dashboards if you need trend analysis beyond GitHub's built-in views.
