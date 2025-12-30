@echo off
echo Testing Memory Bank CLI...

echo.
echo Storing memories:
python cli.py store --content "TRAGY project milestone reached" --tags project milestone --priority 4
python cli.py store --content "Fix authentication bug" --tags bug auth --priority 5
python cli.py store --content "Update documentation" --tags docs --priority 2

echo.
echo Retrieving all memories:
python cli.py retrieve

echo.
echo High priority memories (min priority 4):
python cli.py retrieve --min-priority 4

echo.
echo Project related memories:
python cli.py retrieve --tags project

echo.
echo Memory bank statistics:
python cli.py stats

echo.
echo Test completed!