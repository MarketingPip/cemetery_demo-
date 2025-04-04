require 'open3'
require 'date'

module Jekyll
  module FileModifiedDate
    def file_modified_date(input)
      # Get the full file path relative to the Jekyll source folder
      file_path = File.join(Dir.pwd, input)

      # Fetch the last modification date using Git log (git log -1 --format=%cI)
      get_git_last_modified(file_path)
    end

    # Method to get the last modification date using Git
    def get_git_last_modified(file)
      # Execute git log to get the last commit date for the file
      command = "git log -1 --format=%cI -- #{file}"
      
      # Capture the output of the Git command
      stdout, stderr, status = Open3.capture3(command)

      if status.success? && !stdout.strip.empty?
        # Parse the ISO 8601 formatted date returned by Git
        DateTime.parse(stdout.strip)
      else
        # If no output, return nil (indicating no commit date found)
        nil
      end
    end
  end
end
