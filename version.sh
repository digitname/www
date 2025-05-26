#!/bin/bash
python changelog.py
#python increment.py
bash git.sh
#bash publish.sh


# publish.sh
#!/bin/bash
echo "Starting publication process..."

# Sprawdź czy jesteśmy w virtualenv
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Aktywuj najpierw virtualenv!"
    exit 1
fi



echo "Publication complete!"