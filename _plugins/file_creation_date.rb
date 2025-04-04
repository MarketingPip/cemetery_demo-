require 'open3'
require 'date'

module Jekyll
  class Post
    def file_creation_date
      # Get the full file path relative to the Jekyll source folder
      file_path = File.join(Jekyll.sites[0].source, self.path)

      # Fetch the file's creation date using Git (first commit date)
      get_git_creation_date(file_path)
    end

    # Method to get the creation date of the file using Git (first commit)
    def get_git_creation_date(file)
      # Execute git log to get the first commit date for the file
      command = "git log --reverse --format=%cI -- #{file} | head -n 1"
      
      # Capture the output of the Git command
      stdout, stderr, status = Open3.capture3(command)

      if status.success? && !stdout.strip.empty?
        # Parse the ISO 8601 formatted date returned by Git
        DateTime.parse(stdout.strip)
      else
        # If no output, return nil (indicating no creation date found)
        nil
      end
    end
  end
end

# Register the method as a Liquid filter
module Jekyll
  module FileCreationDateFilter
    def file_creation_date(post)
      post.file_creation_date
    end
  end
end
