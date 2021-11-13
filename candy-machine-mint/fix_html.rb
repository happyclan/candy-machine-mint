path_to_build = './build/index.html'

puts "Reading at path #{path_to_build}"
text = File.read(path_to_build)
#puts("Text is #{text}")

new_contents = text.gsub(/(\/static)/, './static')

#puts("New contents is #{new_contents}")
puts ("New contents written to #{path_to_build}")

# To write changes to the file, use:
File.open('./build/index.html', "w") {|file| file.puts new_contents }
