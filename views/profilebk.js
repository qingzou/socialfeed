<!doctype html>
<html>
<head>
    <title>Social Authenticator</title>
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.0.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css">
    <style>
        body         { padding-top:80px; word-wrap:break-word; }
    </style>
</head>
<body>
<div class="container">

    <div class="page-header text-center">
        <h1><span class="fa fa-user"></span> Profile Page</h1>
        <a href="/logout" class="btn btn-default btn-sm">Logout</a>
    </div>

    <% if (typeof message !== 'undefined' && message.length > 0) { %>
        <h1>WTF</h1>
        <div class="alert alert-danger"><%= message %></div>
    <% } %>

    <div class="row">

        <!-- LOCAL INFORMATION -->
        <div class="col-sm-6">
            <div class="well">
                <h3><span class="fa fa-laptop"></span> Local</h3>

                <% if (user.email) { %>
                    <p>
                        <strong>username</strong>: <%= user.username %><br>
                        <strong>email</strong>: <%= user.email %><br>
                        <strong>password</strong>: <%= user.password %>
                    </p>

                    <a href="/unlink/local" class="btn btn-default">Unlink</a>
                <% } else { %>
                    <a href="/connect/local" class="btn btn-default">Connect Local</a>
                <% } %>

            </div>
        </div>


        <!-- LinkedIn INFORMATION -->
         <div class="col-sm-6">
            <div class="well">
                <h3 class="text-primary"><span class="fa fa-linkedin"></span> LinkedIn</h3>

                <% if (user.linkedin.token) { %>
                    <p>
                        <strong>id</strong>: <%= user.linkedin.id %><br>
                        <strong>token</strong>: <%= user.linkedin.token %><br>
                        <strong>email</strong>: <%= user.linkedin.email %><br>
                        <strong>name</strong>: <%= user.linkedin.name %>
                    </p>

                    <a href="/unlink/linkedin" class="btn btn-primary">Unlink</a>
                <% } else { %>
                    <a href="/connect/linkedin" class="btn btn-primary">Connect LinkedIn</a>
                <% } %>

            </div>
        </div>
    </div>
    <div class="row">

        <!-- FACEBOOK INFORMATION -->
        <div class="col-sm-6">
            <div class="well">
                <h3 class="text-primary"><span class="fa fa-facebook"></span> Facebook</h3>

                <!-- check if the user has this token (is the user authenticated with this social account) -->
                <% if (user.facebook.token) { %>
                    <p>
                        <strong>id</strong>: <%= user.facebook.id %><br>
                        <strong>token</strong>: <%= user.facebook.token %><br>
                        <strong>email</strong>: <%= user.facebook.email %><br>
                        <strong>name</strong>: <%= user.facebook.name %><br>
                    </p>

                    <a href="/unlink/facebook" class="btn btn-primary">Unlink</a>
                <% } else { %>
                    <a href="/connect/facebook" class="btn btn-primary">Connect Facebook</a>
                <% } %>

            </div>
        </div>

        <!-- TWITTER INFORMATION -->
        <div class="col-sm-6">
            <div class="well">
                <h3 class="text-info"><span class="fa fa-twitter"></span> Twitter</h3>

                <% if (user.twitter.token) { %>
                    <p>
                        <strong>id</strong>: <%= user.twitter.id %><br>
                        <strong>token</strong>: <%= user.twitter.token %><br>
                        <strong>display name</strong>: <%= user.twitter.displayName %><br>
                        <strong>username</strong>: <%= user.twitter.username %>
                    </p>

                    <a href="/unlink/twitter" class="btn btn-info">Unlink</a>
                <% } else { %>
                    <a href="/connect/twitter" class="btn btn-info">Connect Twitter</a>
                <% } %>

            </div>
        </div>

    </div>

    <div class="row">
        <!-- GOOGLE INFORMATION -->
        <div class="col-sm-6">
            <div class="well">
                <h3 class="text-danger"><span class="fa fa-google-plus"></span> Google+</h3>

                <% if (user.google.token) { %>
                    <p>
                        <strong>id</strong>: <%= user.google.id %><br>
                        <strong>token</strong>: <%= user.google.token %><br>
                        <strong>email</strong>: <%= user.google.email %><br>
                        <strong>name</strong>: <%= user.google.name %>
                    </p>

                    <a href="/unlink/google" class="btn btn-danger">Unlink</a>
                <% } else { %>
                    <a href="/connect/google" class="btn btn-danger">Connect Google</a>
                <% } %>

            </div>
        </div>
    </div>

</div>
</body>
</html>
