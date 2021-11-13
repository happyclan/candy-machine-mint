@echo "Here we go with building"

call yarn build

@echo "Clean up HTML"
call ruby fix_html.rb

